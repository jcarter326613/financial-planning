import { exit } from "process"
import * as YAML from "yaml"
import { readFileSync, readdirSync, writeFileSync } from 'fs';

const cloneYamlElement = (element: any) => YAML.parse(YAML.stringify(element))

// Extract the arguments
if (process.argv.length != 5)
{
    console.log(`Found ${process.argv.length} arguments`)
    console.log("Usage: generate_lambda_cf.js [tempaltePath] [targetPath] [controller folder]")
    exit(1)
}

console.log("Starting expansion")

let templatePath = process.argv[2]
let targetPath = process.argv[3]
let controllerFolder = process.argv[4]

console.log(`templatPath=${templatePath}`)
console.log(`targetPath=${targetPath}`)
console.log(`controllerFolder=${controllerFolder}`)

// Read in the template
const templateFileContents = readFileSync(templatePath, 'utf-8');
let template = YAML.parseDocument(templateFileContents)
let resourcesNode = template?.get("Resources")
let lambda = resourcesNode?.get("Lambda")
if (lambda != null)
{
    // Remove the lambda from the template
    resourcesNode.delete("Lambda")

    // Get the list of controllers
    let controllerPaths = readdirSync(controllerFolder).map(x => x.split(".").slice(0, -1).join("."))

    // Create new lambda entries
    for (let name of controllerPaths) 
    {
        // Modify for this handler
        let newHandler = `controller\\${name}.handler`
        let newLambda = cloneYamlElement(lambda)
        newLambda["Properties"]["Parameters"]["Handler"] = newHandler
        console.log(`Added handler for ${newHandler}`)

        // Add the handler
        resourcesNode.set(name, newLambda)
    }

    // Write out the template
    let outputYaml = YAML.stringify(template)
    writeFileSync(targetPath, outputYaml);
}
else
{
    console.log("No Lambda found")
}
