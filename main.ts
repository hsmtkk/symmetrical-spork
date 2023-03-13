import { Construct } from "constructs";
import { App, TerraformStack, TerraformAsset, AssetType } from "cdktf";
import * as google from '@cdktf/provider-google';
import * as path from 'path';

const project = 'symmetrical-spork';
const region = 'us-central1';

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new google.provider.GoogleProvider(this, 'google', {
        project,
    });

    const functionRunner = new google.serviceAccount.ServiceAccount(this, 'functionRunner', {
        accountId: 'function-runner',
    });

    const asset = new TerraformAsset(this, 'asset', {
        path: path.resolve('function'),
        type: AssetType.ARCHIVE,
    });

    const assetBucket = new google.storageBucket.StorageBucket(this, 'assetBucket', {
        location: region,
        name: `asset-bucket-20230313`,
        lifecycleRule: [{
            action: {
                type: 'Delete',
            },
            condition: {
                age: 1,
            },
        }],
    });

    const assetObject = new google.storageBucketObject.StorageBucketObject(this, 'assetObject', {
        bucket: assetBucket.name,
        name: asset.assetHash,
        source: asset.path,
    });

    const exampleFunction = new google.cloudfunctions2Function.Cloudfunctions2Function(this, 'exampleFunction', {
        buildConfig: {
            runtime: 'go120',
            source: {
                storageSource: {
                    bucket: assetBucket.name,
                    object: assetObject.name,
                },
            },
        },
        location: region,
        name: 'example-function',
        serviceConfig: {
            serviceAccountEmail: functionRunner.email,
        },
    });

    new google.cloudSchedulerJob.CloudSchedulerJob(this, 'scheduler', {
        name: 'schedule',
        httpTarget: {
            uri: exampleFunction.serviceConfig.uri,
        },
        schedule: '* * * * *',
    });

  }
}

const app = new App();
new MyStack(app, "symmetrical-spork");
app.synth();
