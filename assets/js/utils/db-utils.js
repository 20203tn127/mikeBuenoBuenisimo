//POST => Gestiones de datos de registro p actualizacion pasen por aqui antes de hacer el post real


const incidencesDB = new PouchDB('incidences');

const saveIncidence = (incidence)=>{
    incidence._id = new Date().toISOString();
    return incidencesDB.put(incidence).then(result=>{
        self.registration.sync.register('incidence-post');
        const response = {
            registered: true,
            offline: true,
        };
        return new Response(JSON.stringify(response));
    }).catch(e=>{
        console.log(e);
        const response = {
            registered: false,
            offline: true,
        };
        return new Response(JSON.stringify(response));
    })
}



const saveIncidenceToApi = ()=>{
    const incidences = [];
    return incidencesDB.allDocs({include_docs: true}).then(async docs=>{
        const {rows} = docs;
        for (const row of rows) {
            const {doc} = row;
            try {
                //axios => axios({url: 'fullurl', method: '', data: {} })
                const response = await axiosClient.post('/incidences/save',doc);    
                if (response['registered']) {
                    incidences.push(response);
                }
            } catch (error) {
                console.log(error);
            }finally{ 
                return incidencesDB.remove(doc);
            }
        }
        return Promise.all(incidences);
    })
}