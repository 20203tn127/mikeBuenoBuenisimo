(() => {
  'use strict';
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.clear();
    changeView('');
  }
})();

const incidencesDB = new PounchDB('Incidences');

const acceptIncidence = async () => {
  try {
    const response = await axiosClient.post('/incidences/status',
      {
        idd,
        status: {
          id: 4,

        }
      });
    if (respose['changed']) {
      toastMesaage('Estado cambiado correctamente').showToast();
      getAllIncidencePending();
    }
  } catch (error) {
    console.log(error);
    toastMesaage('Error al cambiar el estado').showToast();
  }
};
const rejectIncidence = async () => {
  try {
    const response = await axiosClient.post('/incidences/status',
      {
        idd,
        status: {
          id: 4,

        }
      });
    if (respose['changed']) {
      toastMesaage('Estado cambiado correctamente').showToast();
      getAllIncidencePending();
    }
  } catch (error) {
    console.log(error);
    toastMesaage('Error al cambiar el estado').showToast();
  }
};

const getAllIncidencePending = async () => {
  try {
    const table = $('#incidencesTable').DataTable();
    table.destroy();
    const user = parseJWT();
    const response = await axiosClient.get(`/incidences/pending/${user.id}`);
    const tableBody = $("#incidencesBody");
    let content = '';
    tableBody.html('');
    const { rows } = await incidencesDB.allDocs({ include_docs: true });
    for (const [i, incidence] of response?.incidences.entries()) {
      const incidenceDate = new Date(incidence.incidenceDate);
      const day = String(incidenceDate.getDate()).padStart(2, '0');
      const month = String(incidenceDate.getMonth() + 1).padStart(2, '0');
      const year = incidenceDate.getFullYear();
      content += `
        <tr>
          <td>${i + 1}</td>
          <td>${incidence.person.name} ${incidence.person.surname} ${incidence.person.lastname}</td>
          <td> ${incidence.user.area.name}</td>
          <td> ${day}/${month}/${year} </td>
          <td> 
            ${rows.find(rows => rows.doc.id === incidence.id)
          ?
          `
              <button class="btn btn-success btn-sm disabled">ACEPTAR</button>
              <button class="btn btn-danger btn-sm disabled">RECHAZAR</button>
              `:
          `
              <button class="btn btn-success btn-sm" onclick="aceptIncidence(${incidence.id})">ACEPTAR</button>
              <button class="btn btn-danger btn-sm" onclick="rejectIncidence(${incidence.id})">RECHAZAR</button>
              `
        }
          </td>
        </tr>
      `;
    }
    tableBody.html(content);
    new DataTable(document.getElementById('incidencesTable'), {
      columnDefs: [{ orderable: false, targets: 4 }],
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json',
      },
    });
  } catch (error) {
    console.log(error);
  }
}
$(document).ready(function () {
  if (!fullname) fullname = localStorage.getItem('fullname');
  if (!role) role = localStorage.getItem('activeRole');
  $('#fullname').text(fullname);
  $('#fullname2').text(fullname);
  $('#role').text(role);
  getAllIncidencePending();
});
