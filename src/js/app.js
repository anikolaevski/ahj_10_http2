/* eslint-disable no-plusplus */

const host = 'https://anikolaevski-ahj10-http.herokuapp.com';
// const host = 'http://localhost';
const port = ''; //':39498';

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line no-console
  console.log('Module started!');
});

const enterform = document.querySelector('#enterform');

function RefillListTbody(data) {
  const ListTbody = document.querySelector('#list_tbody');
  if (!ListTbody) { return; }
  ListTbody.innerHTML = '';
  for (let k = 0; k < data.length; k++) {
    const txt = `
      <td>${k}</td>
      <td>${data[k].id}</td>
      <td>${data[k].name}</td>
      <td>${data[k].description}</td>
      <td>${data[k].status}</td>
      <td>${data[k].created}</td>
    `;
    const tr = document.createElement('tr');
    tr.innerHTML = txt;
    ListTbody.appendChild(tr);
  }
}

function requestList() {
  const url = `${host}${port}/?method=allTickets`;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
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

enterform.addEventListener('submit', (evt) => {
  evt.preventDefault();

  const params = Array.from(evt.target.elements)
    .filter(({ name }) => name)
    .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
    .join('&');
  const url = `${host}${port}/?method=createTicket`;
  // console.log(url);

  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        // const data = JSON.parse(xhr.responseText);
        // console.log(data);
        requestList();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  });

  xhr.send(params);
});
