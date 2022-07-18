const editJsonFile = require("edit-json-file");

class Store{
    constructor(){
        this.file = editJsonFile(`categories.json`, {
            autosave: true
        });

        this.lastCertificate = this.file.get('lastCertificate') ?? 15000

        this.certificates = new Map(Object.entries(this.file.get('certificates')));

        if (!this.file.get('lastCertificate')) this.file.set('lastCertificate',this.lastCertificate)

    }

    createCertificate(userId, certificateId){
        this.lastCertificate++;

        certificateId = certificateId ?? this.lastCertificate

        this.file.set('lastCertificate',this.lastCertificate)

        this.certificates.set(userId, certificateId)

        this.file.set(`certificates.u-${userId}`,certificateId);

        return this.lastCertificate;

    }

    getCertificate(userId){

        return this.file.get(`certificates.u-${userId}`) ?? this.certificates.get(userId) ?? this.createCertificate(userId);

    }
}

module.exports = new Store();