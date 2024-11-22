
import {CreekIcon} from '{{{creekIconPath}}}';
{{#icons}}
import {{.}} from '{{{antIconsPath}}}/es/icons/{{.}}';
{{/icons}}
export default {CreekIcon,{{#icons}}{{.}}, {{/icons}} };