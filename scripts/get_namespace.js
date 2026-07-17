import { Dropbox } from 'dropbox';

const ACCESS_TOKEN = 'your_dropbox_access_token_here'; // Replace with your actual access token
const TARGET_FOLDER_PATH = '/CLEAR-CARE'; // Must start with a slash

async function getTeamFolderNamespace() {
  try {
    // 1. Initial connection to get account layout
    let dbx = new Dropbox({ accessToken: ACCESS_TOKEN });
    const accountInfo = await dbx.usersGetCurrentAccount();
    
    // 2. Extract the overall corporate Team Root Namespace ID
    const rootNamespaceId = accountInfo.result.root_info.root_namespace_id;
    console.log(`🏢 Team Root Namespace ID found: ${rootNamespaceId}`);

    // 3. Re-initialize the client explicitly rooted to the Team Space
    dbx = new Dropbox({
      accessToken: ACCESS_TOKEN,
      pathRoot: JSON.stringify({ '.tag': 'root', 'root': rootNamespaceId })
    });

    // 4. Request folder metadata from the Team Space
    const metadataResponse = await dbx.filesGetMetadata({
      path: TARGET_FOLDER_PATH
    });

    const metadata = metadataResponse.result;

    // 5. Read the distinct Shared Folder Namespace ID
    if (metadata.sharing_info && metadata.sharing_info.shared_folder_id) {
      console.log(`✅ Success!`);
      console.log(`Folder Name: "${metadata.name}"`);
      console.log(`Folder Namespace ID: ${metadata.sharing_info.shared_folder_id}`);
      return metadata.sharing_info.shared_folder_id;
    } else {
      console.log(`⚠️ Folder found, but it is not a sub-shared namespace.`);
    }

  } catch (error) {
    console.error('❌ Error:', error.authError || error.summary || error);
  }
}

getTeamFolderNamespace();