
{{#icons}}
const icons =  {{{icons}}};
const antIconsPath= '{{{antIconsPath}}}';

{{{icons}}}.map((icon) => {
    return `import ${icon} from '${antIconsPath}/es/icons/${icon}';`;
  })
  .join("\n");

export default {icons.join(", ") };
{{/icons}}
