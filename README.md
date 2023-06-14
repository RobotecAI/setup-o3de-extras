Currently two containers are available:

[![Docker Build and Publish 2305](https://github.com/RobotecAI/setup-o3de-extras/actions/workflows/daily-o3de-extras-2305-build.yml/badge.svg)](https://github.com/RobotecAI/setup-o3de-extras/actions/workflows/daily-o3de-extras-2305-build.yml)

[![Docker Build and Publish development](https://github.com/RobotecAI/setup-o3de-extras/actions/workflows/daily-o3de-extras-development-build.yml/badge.svg)](https://github.com/RobotecAI/setup-o3de-extras/actions/workflows/daily-o3de-extras-development-build.yml)

# Action that could be used to test projects that use O3DE-Extras

This action will build and publish the container image containing O3DE-extras to the dockerhub and the reuse this image to build and run your custom tests.

The container is called `ci-o3de-extras:latest` and could be found TODO: add link to the dockerhub.

Versions:
OS: Ubuntu Jammy
O3DE: 2305
O3DE-Extras: 2305.0
ROS2: humble
RMW_IMPLEMENTATION: rmw_fastrtps_cpp
NodeJs: 16

SECRETS:
`DOCKER_HUB_USERNAME`
`DOCKER_HUB_PASSWORD`

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

## Writing tests

### Introduction

The test script is a bash script (executed inside docker container) that should return `RESULT: ALL TESTS PASSED` if all tests passed. If the result is different the action will fail. The container is based on the Ubuntu Jammy and contains O3DE, O3DE-Extras, ROS2, NodeJs and other dependencies needed to build [WarehouseTest Project](https://development--o3deorg.netlify.app/docs/user-guide/interactivity/robotics/project-configuration/).

The images are based on the [docker](./docker/) dockerfiles.

The o3de is installed form binary so the path is `/opt/O3DE/23.05.0/scripts/o3de.sh` 

The o3de-extras is cloned into `/data/workspace/o3de-extras`

If the user tests `o3de-extras` the directory `/data/workspace/o3de-extras` is mounted into the container hovering the /data/workspace/o3de-extras inside the container. This allows to test the changes made to the o3de-extras and the PR. In other cases the directory is mounted into the `/data/workspace/repository` directory. So the user should use the `/data/workspace/repository` directory to access the tested repository.

### Example

Here is an example of the test script that builds the WarehouseTest project (check if it builds). The user is allowed to add any other tests to the script, install dependencies, run CTest, etc.


Create a new file `Test/script.sh` inside the repository that you want to test. Add the following content to test build of the o3de-extras WarehouseTest project:

```bash
#!/bin/bash

echo "Running test script"

# Test
. /opt/ros/humble/setup.sh

cd /data/workspace/WarehouseTest

if cmake --build build/linux --config profile --target WarehouseTest.GameLauncher Editor ; then
    VALUE="RESULT: ALL TESTS PASSED" # expected result
    echo "Build succeeded"
else
    VALUE="RESULT: Build failed"
fi

# Print the value, needed for the action to get the result
echo $VALUE

exit 0
```

## Create an workflow that uses this action

Create a new workflow file (e.g. `.github/workflows/test.yml`) and add the following content:

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
        uses: RobotecAI/setup-o3de-extras@0.1 # change to use the latest version
        with:
          script-path: Test/script.sh # path to the test script inside tested repository
          container: robotecai/o3de-2305-extras-2305:latest # container image to use
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

