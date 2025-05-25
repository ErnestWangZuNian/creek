import { CreekConfigProvider } from '{{{creekWebComponentsPath}}}';

import icons from './icons';

function formatIcon(name: string) {
  return name
    .replace(name[0], name[0].toUpperCase())
    .replace(/-(\w)/g, function (all, letter) {
      return letter.toUpperCase();
    });
}

export function patchRoutes({ routes }) {
  Object.keys(routes).forEach((key) => {
    const { icon } = routes[key];
    if (icon && typeof icon === 'string') {
      const upperIcon = formatIcon(icon);
      if (icons[upperIcon] || icons[upperIcon + 'Outlined']) {
        const IconComponentName = icons[upperIcon] || icons[upperIcon + 'Outlined'];
        routes[key].icon = <IconComponentName />;
      }
      {{#hasIconFontCNs}}
      else {
        const CreekIcon = icons.CreekIcon;
        routes[key].icon = <CreekIcon type={icon} />;
      }
      {{/hasIconFontCNs}}
    }
  });
}

export function rootContainer(container){
  const iconFontCNs={{{iconFontCNs}}};
  const result = <CreekConfigProvider iconFontCNs={iconFontCNs}>
    {container}
  </CreekConfigProvider>;
  
  return result;
}


