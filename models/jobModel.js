import UUID from 'node-uuid'

class JobModel {
    constructor(user){
        super()
        this.id = UUID.v4()
        this.user = user
        this.req = {}
        this.res = {}
    }

    updateJob(){
        
    }
}