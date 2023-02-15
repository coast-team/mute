/**
 * This class creates two maps to link the networkId used in the network.service.ts
 * to the muteCoreId used in the muteCore package.
 */
export class IdMap{

    public networkIdToMuteCoreIdMap : Map<number, number>
    public muteCoreIdToNetworkIdMap : Map<number, number>

    public constructor(){
        this.networkIdToMuteCoreIdMap = new Map()
        this.muteCoreIdToNetworkIdMap = new Map()
    }

    /**
     * Add the correct values in the identifier maps
     * @param networkId
     * @param muteCoreId
     */
    addIds(networkId : number, muteCoreId : number){
        this.networkIdToMuteCoreIdMap.set(networkId, muteCoreId)
        this.muteCoreIdToNetworkIdMap.set(muteCoreId, networkId)
    }

    /**
     * Remove the key/value pair related to the muteCoreId in the parameter
     * @param muteCoreId to remove, also used to determine which networkId to remove
     */
    removeIds(muteCoreId : number){
        const collaboratorNetworkId = this.muteCoreIdToNetworkIdMap.get(muteCoreId)
        this.networkIdToMuteCoreIdMap.delete(collaboratorNetworkId)
        this.muteCoreIdToNetworkIdMap.delete(muteCoreId)
    }


    getMuteCoreId(networkId : number){
        return this.networkIdToMuteCoreIdMap.get(networkId)
    }

    getNetworkId(muteCoreId : number){
        return this.muteCoreIdToNetworkIdMap.get(muteCoreId)
    }

}