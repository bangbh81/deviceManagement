import * as functions from 'firebase-functions';

const iot = require('@google-cloud/iot');
const client = new iot.v1.DeviceManagerClient();

/* Firestore trigger dataSource onCreate*/
exports.deviceOnCreate = functions.firestore.document('dataSource/{dataSourceId}').onCreate( async (dataSnapshot, context) => {
  console.log('Device Created');
  const formattedParent = client.registryPath('wiznet-cloud-360', 'asia-east1', 'wizfi360default');
  const device = {
    id: context.params.dataSourceId
  };
  const request = {
    parent: formattedParent,
    device: device,
  };
  try{
    await client.createDevice(request);
  } catch(error){
    console.log(error);
  }
});

/* Firestore trigger dataSource onDelete*/
exports.deviceOnDelete = functions.firestore.document('dataSource/{dataSourceId}').onDelete( async (dataSnapshot, context) => {
  console.log('Device deleted');
  const formattedName = client.devicePath('wiznet-cloud-360', 'asia-east1', 'wizfi360default', context.params.dataSourceId);

  const request = {
    name: formattedName,
  };
  try{
    await client.deleteDevice(request);
  } catch(error){
    console.log(error);
  }
});


exports.deviceConfig = functions.firestore.document('dataSource/{dataSourceId}/config/{configId}')
                                          .onCreate(async (dataSnapshot, context) => {
  console.log('Send configure to device!');
  const config = dataSnapshot.data();
  console.log('newValue:', config);
  console.log('context: ', context);

  const formattedName = client.devicePath('wiznet-cloud-360', 'asia-east1', 'wizfi360default', context.params.dataSourceId);

  try{
    if(config !== undefined){
      console.log(config.message)
      const request = {
        name: formattedName,
        binaryData: Buffer.from(config!.message).toString('base64')
      };
      const result = await client.modifyCloudToDeviceConfig(request);
      console.log(result);
    }
  } catch(error) {
    console.log(error);
  }
});

exports.deviceCommand = functions.firestore.document('dataSource/{dataSourceId}/command/{commandId}')
                                            .onCreate(async (dataSnapshot, context) => {
  console.log('Send command to the device!');
  const command = dataSnapshot.data();
  console.log(command);
  console.log('context: ', context);
  
  const formattedName = client.devicePath('wiznet-cloud-360', 'asia-east1', 'wizfi360default', context.params.dataSourceId);

  try{
    if(command !== undefined){
      console.log(command.message)

      const request = {
        name: formattedName,
        binaryData: Buffer.from(command.message).toString('base64'),
        subfolder: command.subfolder?command.subfolder:null
      };
      const result = await client.sendCommandToDevice(request)
      console.log(result);
    }
  } catch(error) {
    console.log(error);
  }
});