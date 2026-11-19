const DATABASE_NAME = "sr-ems-files";
const STORE_NAME = "uploaded-files";
const DATABASE_VERSION = 1;

function openDatabase() {
  if (!("indexedDB" in globalThis)) {
    return Promise.reject(new Error("This browser does not support local document storage."));
  }
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Could not open document storage."));
  });
}

export async function saveStoredFile(id, file) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put({ id, file });
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(new Error("Could not save the selected document.")); };
    transaction.onabort = () => { database.close(); reject(new Error("Document storage cancelled the upload.")); };
  });
}

export async function downloadStoredFile(id, fileName) {
  const database = await openDatabase();
  const record = await new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Could not read the selected document."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => { database.close(); reject(new Error("Could not read the selected document.")); };
  });
  if (!record?.file) throw new Error("The document file is missing from this browser.");
  const url = URL.createObjectURL(record.file);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function deleteStoredFile(id) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(new Error("Could not delete the stored document.")); };
    transaction.onabort = () => { database.close(); reject(new Error("Document deletion was cancelled.")); };
  });
}
