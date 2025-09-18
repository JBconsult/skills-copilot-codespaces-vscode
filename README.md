<header>

<!--
  <<< Author notes: Course header >>>
  Read <https://skills.github.com/quickstart> for more information about how to build courses using this template.
  Include a 1280×640 image, course name in sentence case, and a concise description in emphasis.
  In your repository settings: enable template repository, add your 1280×640 social image, auto delete head branches.
  Next to "About", add description & tags; disable releases, packages, & environments.
  Add your open source license, GitHub uses the MIT license.
-->

# Code with GitHub Copilot

_GitHub Copilot can help you code by offering autocomplete-style suggestions right in VS Code and Codespaces._

</header>

<!--
  <<< Author notes: Step 2 >>>
  Start this step by acknowledging the previous step.
  Define terms and link to docs.github.com.
-->

## Step 2: Seeing AI code suggestions in a Javascript file!

_Nice work! :tada: You created a Codespace using a devcontainer file that installed Copilot!_

GitHub Copilot provides suggestions for numerous languages and a wide variety of frameworks, but works especially well for Python, JavaScript, TypeScript, Ruby, Go, C# and C++. The following samples are in JavaScript, but other languages will work similarly.

Let's try this out utilizing Javascript for Copilot.

### :keyboard: Activity: Add a Javascript file and start writing code

1. From inside the codespace in the VS Code explorer window, create a new file.

> **Note**:
> If you closed the Codespace from above, please open it back up or create a new Codespace.

2. Name the file `skills.js`
3. Verify your new file looks like:
   ![Screen Shot 2023-03-09 at 9 21 34 AM](https://user-images.githubusercontent.com/26442605/224105906-d1beb531-b747-4c7a-85ba-a12526488422.png)
4. In the `skills.js` file, type the following function header.

   ```
   function calculateNumbers(var1, var2)
   ```

   GitHub Copilot will automatically suggest an entire function body in grayed text. Below is an example of what you'll most likely see, but the exact suggestion may vary.
   ![Screen Shot 2023-04-27 at 10 23 06 AM](https://user-images.githubusercontent.com/26442605/234941079-b4bf3e9d-fc70-4b20-b74c-0ee753ba344e.png)

5. Press `Tab` to accept the suggestion.

### :keyboard: Activity: Push code to your repository from the codespace

1. Use the VS Code terminal to add the `skills.js` file to the repository:

   ```
   git add skills.js
   ```

2. Next from the VS Code terminal stage and commit the changes to the repository:

   ```
   git commit -m "Copilot first commit"
   ```

3. Finally from the VS Code terminal push to code to the repository:

   ```
   git push
   ```

**Wait about 60 seconds then refresh your repository landing page for the next step.**

## 🚀 Azure Cloud Development

Looking to take your development to the cloud? This repository now includes comprehensive guidance for building and deploying applications in Microsoft Azure!

### 📚 Azure Development Resources

- **[Azure Development Guide](AZURE_DEVELOPMENT_GUIDE.md)** - Complete guide for developing apps in Azure
- **[Azure Examples](azure-examples/)** - Ready-to-use templates and configurations including:
  - ARM templates for infrastructure
  - Docker configurations
  - CI/CD pipelines (GitHub Actions & Azure DevOps)
  - Terraform and Bicep examples
  - Deployment scripts

### 🛠️ What You'll Learn

- Setting up Azure development environments with virtual machines
- Building cloud-native applications
- Testing strategies for Azure applications
- Deployment options (App Service, Containers, Kubernetes)
- CI/CD pipeline integration
- Monitoring and troubleshooting
- Security best practices
- Cost optimization techniques

### ⚡ Quick Start with Azure

1. **Read the [Azure Development Guide](AZURE_DEVELOPMENT_GUIDE.md)** for comprehensive instructions
2. **Explore the [azure-examples](azure-examples/)** directory for templates and scripts
3. **Use the deployment script**: `./azure-examples/deploy.sh -g myapp-rg -a myapp deploy`

Perfect for developers who want to:
- Develop applications in cloud environments
- Learn Azure services and best practices
- Implement DevOps practices with Azure
- Scale applications globally
- Build production-ready cloud solutions

<footer>

<!--
  <<< Author notes: Footer >>>
  Add a link to get support, GitHub status page, code of conduct, license link.
-->

---

Get help: [Post in our discussion board](https://github.com/skills/.github/discussions) &bull; [Review the GitHub status page](https://www.githubstatus.com/)

&copy; 2023 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

</footer>
