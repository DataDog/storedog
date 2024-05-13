## Description

This directory holds the infrastrucutre templates to run Storedog on AWS ECS via EC2. EC2 is the preferred hosting engine due to the `bridge` network mode, which is not available in Fargate. This allows our containers to inter-communicate.

The memory and CPU settings defined in the `storedog-task-definition.json` assume you are running at least one `m3.xlarge` instance. Note that these settings have not yet been optimized so there is an opportunity to downsize.