/* eslint-disable no-plusplus */

const host = 'https://anikolaevski-ahj10-http.herokuapp.com';
const port = ''; // ':39498';

const ListTbody = document.querySelector('#list_tbody2');
const RecTemplate = document.querySelector('.rec-template');
const NewTicketButton = document.querySelector('#new-ticket-button');
let CurrentRow;
let CurrentData = {};

function formatCreaDate(d) {
  const dd = d.getDate();
  const mm = (d.getMonth() + 101).toString().substring(1, 3);
  // console.log(mm);
  return [d.getFullYear(), mm, dd < 10 ? `0${dd}` : dd].join('-');
}

function rowEdit(data, EditMode) {
  // eslint-disable-next-line no-console
  // console.log('edit', data);
  const EditPopupTemplate = document.querySelector('#edit-popup-template');
  if (!EditPopupTemplate) { return; }
  EditPopupTemplate.classList.remove('nodisp');
  const EditPopupHeader = EditPopupTemplate.querySelector('.popup-header');
  if (EditPopupHeader) {
    EditPopupHeader.innerText = `${(EditMode) ? 'Изменить' : 'Добавить'} тикет`;
  }
  // populate fields
  const FormName = EditPopupTemplate.querySelector('#popup_fld_name');
  const FormDescription = EditPopupTemplate.querySelector('#popup_fld_description');
  if (!FormName || !FormDescription) { return; }
  FormName.value = data.name;
  FormDescription.value = data.description;
  // reassign save button listener
  const PopupEnterbutton = EditPopupTemplate.querySelector('#popup_enterbutton');
  if (!PopupEnterbutton) { return; }
  if (EditMode) {
    CurrentData.id = data.id;
  } else {
    CurrentData = {};
  }
}

function ListBodyEdit(evt) {
  evt.preventDefault();
  evt.stopPropagation();
  let el = evt.target;
  while (el.nodeName.toUpperCase() !== 'TR') { el = el.parentNode; }
  rowEdit({
    id: el.getAttribute('data-id'),
    name: el.getAttribute('data-name'),
    description: el.getAttribute('data-description'),
  }, true);
}

function ListBodyDelete(evt) {
  evt.preventDefault();
  evt.stopPropagation();
  let el = evt.target;
  while (el.nodeName.toUpperCase() !== 'TR') { el = el.parentNode; }
  const id = el.getAttribute('data-id');
  const name = el.getAttribute('data-name');
  const DeletePopupTemplate = document.querySelector('#delete-popup-template');
  if (!DeletePopupTemplate) { return; }
  DeletePopupTemplate.classList.remove('nodisp');
  const DeleteTicketText = document.querySelector('#delete-ticket-text');
  DeleteTicketText.innerText = `"${name}"`;
  CurrentData.id = id;
}

function RefillListTbody(data) {
  if (!RecTemplate || !ListTbody) { return; }
  ListTbody.innerHTML = '';
  for (let k = 0; k < data.length; k++) {
    const tr = RecTemplate.cloneNode(true);
    ListTbody.appendChild(tr);
    tr.setAttribute('data-id', data[k].id);
    tr.setAttribute('data-name', data[k].name);
    tr.setAttribute('data-description', data[k].description);
    tr.setAttribute('data-status', data[k].status);
    tr.classList.remove('rec-template');
    const RecStatus = tr.querySelector('.rec-status');
    const RecShortname = tr.querySelector('.rec-shortname');
    const RecCreated = tr.querySelector('.rec-created');
    const RecEditControl = tr.querySelector('.rec-edit-control');
    const RecDeleteControl = tr.querySelector('.rec-delete-control');
    if (data[k].status === 'done') {
      const rs = RecStatus.querySelector('.statis-wid');
      if (rs) {
        rs.classList.add('status-done');
      }
    }
    RecShortname.innerText = data[k].name;
    RecCreated.innerText = formatCreaDate(new Date(data[k].created));
    RecEditControl.addEventListener('click', ListBodyEdit);
    RecDeleteControl.addEventListener('click', ListBodyDelete);
    /* eslint-disable no-use-before-define */
    RecStatus.addEventListener('click', ListBodyState);
    tr.addEventListener('click', ListBodyClick);
  }
}

function requestList() {
  const url = `${host}${port}/?method=allTickets`;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.addEventListener('loadend', () => {
    // TODO: request finished
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const data = JSON.parse(xhr.responseText);
        // console.log(data);
        RefillListTbody(data);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  });
  xhr.send();
}

function ListBodyState(evt) {
  evt.preventDefault();
  evt.stopPropagation();
  let el = evt.target;
  while (el.nodeName.toUpperCase() !== 'TR') { el = el.parentNode; }
  const id = el.getAttribute('data-id');
  // eslint-disable-next-line no-console
  // console.log(`status ${id}`);
  const RecStatus = el.querySelector('.rec-status');
  if (!RecStatus) { return; }
  let status = el.getAttribute('data-status');
  if (status === 'new') {
    status = 'done';
  } else {
    status = 'new';
  }
  el.setAttribute('data-status', status);
  const StatusWid = RecStatus.querySelector('.statis-wid');
  if (status === 'done') {
    StatusWid.classList.add('status-done');
  } else {
    StatusWid.classList.remove('status-done');
  }
  // post status to server
  const params = [
    { name: 'id', value: id },
    { name: 'status', value: status },
  ].filter(({ name }) => name)
    .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
    .join('&');
  const url = `${host}${port}/?method=setStatus`;
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        requestList();
      } catch (e) {
      // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  });
  xhr.send(params);
}

function ListBodyClick(evt) {
  evt.preventDefault();
  let el = evt.target;
  while (el.nodeName.toUpperCase() !== 'TR') { el = el.parentNode; }
  // const id = el.getAttribute('data-id');
  const description = el.getAttribute('data-description');
  // cleanup previous selected row
  let txt;
  if (CurrentRow) {
    txt = CurrentRow.getAttribute('data-name');
    const CurrentShortname = CurrentRow.querySelector('.rec-shortname');
    CurrentShortname.innerHTML = txt;
  }
  // reassign and open current row
  CurrentRow = el;
  const RecShortname = CurrentRow.querySelector('.rec-shortname');
  if (!RecShortname) { return; }
  txt = `${RecShortname.innerHTML}<p>${description}</p>`;
  RecShortname.innerHTML = txt;
}

function saveFunc(evt) {
  evt.preventDefault();
  evt.stopPropagation();
  // prepare save data
  const EditPopupForm = document.querySelector('#edit-popup-form');
  const EditPopupTemplate = document.querySelector('#edit-popup-template');
  const x = Array.from(EditPopupForm.elements).filter(({ name }) => name);
  const saveData = [];
  if (Object.keys(CurrentData).includes('id')) {
    saveData.push({ name: 'id', value: CurrentData.id });
  }
  for (const fld of x) {
    saveData.push({ name: fld.name, value: fld.value });
  }

  // eslint-disable-next-line no-console
  console.log(saveData);
  // post
  const params = saveData
    .filter(({ name }) => name)
    .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
    .join('&');
  const url = `${host}${port}/?method=createTicket`;
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        requestList();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  });

  xhr.send(params);

  EditPopupTemplate.classList.add('nodisp');
}

function doListBodyDeleteCancel(evt) {
  evt.preventDefault();
  const DeletePopupTemplate = document.querySelector('#delete-popup-template');
  if (!DeletePopupTemplate) { return; }
  DeletePopupTemplate.classList.add('nodisp');
}

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line no-console
  console.log('Module started!');
  requestList();
});

NewTicketButton.addEventListener('click', (evt) => {
  evt.preventDefault();
  rowEdit({
    name: '',
    description: '',
  }, false);
});

function doListBodyDelete(evt) {
  evt.preventDefault();
  const DeletePopupTemplate = document.querySelector('#delete-popup-template');
  if (!DeletePopupTemplate) { return; }
  DeletePopupTemplate.classList.add('nodisp');
  // eslint-disable-next-line no-console
  console.log(`delete ${CurrentData.id}`);
  // post
  const params = [
    { name: 'id', value: CurrentData.id },
  ].filter(({ name }) => name)
    .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
    .join('&');
  CurrentData = {};
  const url = `${host}${port}/?method=delete`;
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        requestList();
      } catch (e) {
      // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  });
  xhr.send(params);
}

document.querySelector('#popup_enterbutton').addEventListener('click', saveFunc);
document.querySelector('#popup_deletebutton').addEventListener('click', doListBodyDelete);
document.querySelector('#popup_delcancelbutton').addEventListener('click', doListBodyDeleteCancel);

// enterform.addEventListener('submit', (evt) => {
//   evt.preventDefault();

//   const params = Array.from(evt.target.elements)
//     .filter(({ name }) => name)
//     .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
//     .join('&');
//   const url = `${host}${port}/?method=createTicket`;
//   // console.log(url);

//   const xhr = new XMLHttpRequest();
//   xhr.open('POST', url, true);
//   xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

//   xhr.addEventListener('load', () => {
//     if (xhr.status >= 200 && xhr.status < 300) {
//       try {
//         // const data = JSON.parse(xhr.responseText);
//         // console.log(data);
//         requestList();
//       } catch (e) {
//         // eslint-disable-next-line no-console
//         console.error(e);
//       }
//     }
//   });

//   xhr.send(params);
// });
