[![Docker Build and Publish](https://github.com/RobotecAI/setup-o3de-extras/actions/workflows/daily-o3de-extras-build.yml/badge.svg)](https://github.com/RobotecAI/setup-o3de-extras/actions/workflows/daily-o3de-extras-build.yml)

# Action that could be used to test projects that use O3DE-Extras

This action will build and publish the container image containing O3DE-extras to the dockerhub and the reuse this image to build and run your custom tests.

The container is called `ci-o3de-extras:latest` and could be found TODO: add link to the dockerhub.

Versions:
OS: Ubuntu Jammy
O3DE: 2305
O3DE-Extras: 2305.0
ROS2: humble
NodeJs: 16

Github large runner or self-hosted runner is required to run this action. (The container is too big for the regular runner, ~32GB)

## Requirements

Test script. This action allows to execute your custom tests inside the container. Remember that the script should be executable (`chmod +x`).

Example of the test script:
```bash
#!/bin/bash

# Expected result
VALUE="RESULT: ALL TESTS PASSED"

# Print the value
echo $VALUE

exit 0
```

Expected result form the test script is `RESULT: ALL TESTS PASSED`. If the result is different the action will fail.


## Create an workflow that uses this action

```yaml
name: TEST - Build with O3DE Extras

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - '*'

jobs:
  build:
    runs-on: self-hosted

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up O3DE Extras
        uses: robotec.ai/setup-o3de-extras@0.1
        with:
          script-path: test/script.sh
```


## Modifying the action

1. Modify the action by editing `action.yml` and `src/main.ts`. 
2. Install the dependencies
```bash
npm install
```
3. Build the typescript and package it for distribution
```bash
npm run build && npm run package
```
4. Run the tests :heavy_check_mark:  
```bash
npm test # this will run the `__tests__/main.test.js` using Jest
```

To add files from different paths modify the `tsconfig.build.json` file.

## Change action.yml

The action.yml defines the inputs and output for your action.

Update the action.yml with your name, description, inputs and outputs for your action.

See the [documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions)

## Publish 

To publish a new version: 
1. RUN `npm run build && npm run package`
2. Commit the changes
3. Create a new tag with the version number (e.g. `v1.0.0`)
4. Push the changes to the repo
5. Create a new release with the same tag version you used before (e.g. `v1.0.0`) from the Releases tab on your GitHub repo.

