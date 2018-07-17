let state

export enum EIndexedDBState {
  NO_ACCESS = 1,
  NOT_SUPPORTED = 2,
  OK = 3,
}

export async function getIndexedDBState(): Promise<EIndexedDBState> {
  if (!state) {
    if (window.indexedDB) {
      // open test
      const openSuccess = await new Promise((resolve) => {
        const openRequest = indexedDB.open('test:indexeddb')
        openRequest.onerror = (err) => resolve(false)
        openRequest.onsuccess = () => {
          openRequest.result.close()
          resolve(true)
        }
      })
      // delete if open test succeed
      if (openSuccess) {
        state = EIndexedDBState.OK
        // Delete database
        // await new Promise((resolve) => {
        //   const deleteRequest = indexedDB.deleteDatabase('test:indexeddb')
        //   deleteRequest.onerror = (err) => {
        //     log.warn('Failed delete local-storage-test database')
        //     resolve()
        //   }
        //   deleteRequest.onsuccess = () => {
        //     resolve()
        //   }
        // })
      } else {
        state = EIndexedDBState.NO_ACCESS
      }
    } else {
      state = EIndexedDBState.NOT_SUPPORTED
    }
  }
  return state
}
