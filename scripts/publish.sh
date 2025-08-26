#!/bin/bash

# 智能 npm 包发布脚本
# 功能：自动版本检测、增量发布、变更检测

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必要工具
check_dependencies() {
    log_info "检查依赖工具..."
    
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        log_error "git 未安装"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log_warning "jq 未安装，将使用 node 脚本解析 JSON"
    fi
}

# 获取包的当前版本
get_package_version() {
    local package_path=$1
    if [ -f "$package_path/package.json" ]; then
        if command -v jq &> /dev/null; then
            jq -r '.version' "$package_path/package.json"
        else
            node -p "require('$package_path/package.json').version"
        fi
    else
        echo "0.0.0"
    fi
}

# 获取包名
get_package_name() {
    local package_path=$1
    if [ -f "$package_path/package.json" ]; then
        if command -v jq &> /dev/null; then
            jq -r '.name' "$package_path/package.json"
        else
            node -p "require('$package_path/package.json').name"
        fi
    fi
}

# 检查 npm 上的最新版本
get_npm_version() {
    local package_name=$1
    npm view "$package_name" version 2>/dev/null || echo "0.0.0"
}

# 版本比较和递增
increment_version() {
    local version=$1
    local type=${2:-patch}  # patch, minor, major
    
    IFS='.' read -ra VERSION_PARTS <<< "$version"
    local major=${VERSION_PARTS[0]}
    local minor=${VERSION_PARTS[1]}
    local patch=${VERSION_PARTS[2]}
    
    case $type in
        "major")
            echo "$((major + 1)).0.0"
            ;;
        "minor")
            echo "$major.$((minor + 1)).0"
            ;;
        "patch")
            echo "$major.$minor.$((patch + 1))"
            ;;
        *)
            echo "$major.$minor.$((patch + 1))"
            ;;
    esac
}

# 检查包是否有变更
has_package_changed() {
    local package_path=$1
    local last_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    
    if [ -z "$last_tag" ]; then
        log_info "没有找到标签，认为包已变更"
        return 0
    fi
    
    # 检查自上次标签以来是否有文件变更
    local changed_files=$(git diff --name-only "$last_tag" HEAD -- "$package_path/")
    
    if [ -n "$changed_files" ]; then
        log_info "检测到变更文件:"
        echo "$changed_files" | sed 's/^/  - /'
        return 0
    else
        return 1
    fi
}

# 更新 package.json 版本
update_package_version() {
    local package_path=$1
    local new_version=$2
    
    if command -v jq &> /dev/null; then
        jq ".version = \"$new_version\"" "$package_path/package.json" > "$package_path/package.json.tmp"
        mv "$package_path/package.json.tmp" "$package_path/package.json"
    else
        node -e "
            const fs = require('fs');
            const pkg = require('$package_path/package.json');
            pkg.version = '$new_version';
            fs.writeFileSync('$package_path/package.json', JSON.stringify(pkg, null, 2) + '\\n');
        "
    fi
}

# 构建包
build_package() {
    local package_path=$1
    local package_name=$(basename "$package_path")
    
    log_info "构建包: $package_name"
    
    cd "$package_path"
    
    # 检查是否有构建脚本
    if npm run | grep -q "father:build"; then
        npm run father:build
    elif npm run | grep -q "build"; then
        npm run build
    else
        log_warning "没有找到构建脚本，跳过构建"
    fi
    
    cd - > /dev/null
}

# 发布单个包
publish_package() {
    local package_path=$1
    local package_name=$(get_package_name "$package_path")
    local current_version=$(get_package_version "$package_path")
    local npm_version=$(get_npm_version "$package_name")
    local increment_type=${2:-patch}
    
    log_info "处理包: $package_name"
    log_info "当前版本: $current_version"
    log_info "NPM 版本: $npm_version"
    
    # 检查是否有变更
    if ! has_package_changed "$package_path"; then
        log_warning "包 $package_name 没有变更，跳过发布"
        return 0
    fi
    
    # 确定新版本
    local new_version
    if [ "$current_version" = "$npm_version" ]; then
        new_version=$(increment_version "$current_version" "$increment_type")
        log_info "版本相同，自动递增到: $new_version"
        update_package_version "$package_path" "$new_version"
    else
        new_version="$current_version"
        log_info "使用当前版本: $new_version"
    fi
    
    # 构建包
    build_package "$package_path"
    
    # 发布到 npm
    log_info "发布 $package_name@$new_version 到 npm..."
    
    cd "$package_path"
    
    # 检查是否需要登录
    if ! npm whoami &> /dev/null; then
        log_error "请先登录 npm: npm login"
        exit 1
    fi
    
    # 发布
    if npm publish --access public; then
        log_success "成功发布 $package_name@$new_version"
        
        # 创建 git 标签
        cd - > /dev/null
        git add "$package_path/package.json"
        git commit -m "chore: release $package_name@$new_version" || true
        git tag "$package_name@$new_version"
        
        return 0
    else
        log_error "发布 $package_name 失败"
        cd - > /dev/null
        return 1
    fi
}

# 主函数
main() {
    local increment_type=${1:-patch}
    local specific_package=$2
    
    log_info "开始智能发布流程..."
    log_info "版本递增类型: $increment_type"
    
    check_dependencies
    
    # 确保在项目根目录
    if [ ! -f "pnpm-workspace.yaml" ] && [ ! -f "package.json" ]; then
        log_error "请在项目根目录运行此脚本"
        exit 1
    fi
    
    # 检查工作区是否干净
    if [ -n "$(git status --porcelain)" ]; then
        log_warning "工作区有未提交的变更，建议先提交"
        read -p "是否继续？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    local packages_dir="packages"
    local published_count=0
    local failed_count=0
    
    if [ -n "$specific_package" ]; then
        # 发布特定包
        local package_path="$packages_dir/$specific_package"
        if [ -d "$package_path" ]; then
            if publish_package "$package_path" "$increment_type"; then
                ((published_count++))
            else
                ((failed_count++))
            fi
        else
            log_error "包 $specific_package 不存在"
            exit 1
        fi
    else
        # 发布所有包
        for package_path in "$packages_dir"/*; do
            if [ -d "$package_path" ] && [ -f "$package_path/package.json" ]; then
                if publish_package "$package_path" "$increment_type"; then
                    ((published_count++))
                else
                    ((failed_count++))
                fi
            fi
        done
    fi
    
    # 推送标签到远程
    if [ $published_count -gt 0 ]; then
        log_info "推送标签到远程仓库..."
        git push origin --tags
        git push origin main || git push origin master
    fi
    
    # 总结
    log_success "发布完成！"
    log_info "成功发布: $published_count 个包"
    if [ $failed_count -gt 0 ]; then
        log_warning "失败: $failed_count 个包"
    fi
}

# 显示帮助
show_help() {
    echo "Creek.js 智能发布脚本"
    echo ""
    echo "用法:"
    echo "  $0 [increment_type] [package_name]"
    echo ""
    echo "参数:"
    echo "  increment_type  版本递增类型 (patch|minor|major)，默认: patch"
    echo "  package_name    指定要发布的包名，不指定则发布所有变更的包"
    echo ""
    echo "示例:"
    echo "  $0                    # 发布所有变更的包，patch 版本递增"
    echo "  $0 minor              # 发布所有变更的包，minor 版本递增"
    echo "  $0 patch cache        # 只发布 cache 包，patch 版本递增"
    echo "  $0 major request      # 只发布 request 包，major 版本递增"
}

# 解析命令行参数
case "$1" in
    "-h"|"--help")
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac