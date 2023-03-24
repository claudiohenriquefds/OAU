#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function processFirstRef(basePath, content) {
  const refs = content.match(/\$ref:\s*([^\n]+)/g);

  for (const ref of refs) {
    const route = ref.split(/\s+/)[1].replace('./', '').replace(/"/g, '').replace(/'/g, '');
    const routePath = path.join(basePath, route);
    let routeYaml = fs.readFileSync(routePath, 'utf8');

    if(routeYaml.includes('/')){
        routeYaml = routeYaml.replace(/^/gm, '  ');
    }

    content = content.replace(ref, routeYaml).replace("  /", "/");
  }
  
  const remaining = content.match(/\$ref:/g);
  
  if (remaining) {
    content = processSecondRef(basePath, content);
  }

  return content;
}

function processSecondRef(basePath, content) {
    const refs = content.match(/\$ref:\s*([^\n]+)/g);
    
    for (const ref of refs) {
        const route = ref.split(/\s+/)[1].replace('./', '').replace(/"/g, '');
        const routePath = path.join(basePath, route);
        let routeYaml = fs.readFileSync(routePath, 'utf8');
        console.log(refs);

        let identation = routeYaml.split('\n').map((e, index) => {
            if(index > 0){
                return "    " + e + '\n';
            }
            return e + "\n";
        });

        const identationWithFormat = identation.join("");

        content = content.replace(ref, identationWithFormat);
    }
    
    const remaining = content.match(/\$ref:/g);
    
    if (remaining) {
      content = processSecondRef(basePath, content);
    }
  
    return content;
  }

function startProcess(basePath) {
  const mainYaml = fs.readFileSync(path.join(basePath, 'main.yaml'), 'utf8');
  const content = processFirstRef(basePath, mainYaml);

  fs.writeFileSync(path.join(basePath, 'openapi.yaml'), content);
}

if (require.main === module) {
  startProcess(process.argv[2]);
}

module.exports = { startProcess, processFirstRef, processSecondRef };
