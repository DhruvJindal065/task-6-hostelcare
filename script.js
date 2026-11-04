/* HostelCare - Task 6: three JavaScript features
   Feature 1: Contact form validation with inline error messages
   Feature 2: Service requests saved in the browser (localStorage) with a list and delete
   Feature 3: Login form validation and password show/hide toggle
*/

(function () {
  'use strict';

  var STORAGE_KEY = 'hostelcare_requests';

  /* ---------- Helpers ---------- */

  function showError(input, message) {
    var errorEl = document.getElementById(input.id + '-error');
    input.classList.add('input-invalid');
    input.setAttribute('aria-invalid', 'true');
    if (errorEl) errorEl.textContent = message;
  }

  function clearError(input) {
    var errorEl = document.getElementById(input.id + '-error');
    input.classList.remove('input-invalid');
    input.removeAttribute('aria-invalid');
    if (errorEl) errorEl.textContent = '';
  }

  function loadRequests() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveRequests(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      /* Storage unavailable (e.g. private mode); request list just won't persist */
    }
  }

  /* ---------- Feature 1 & 2: Contact form ---------- */

  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var nameInput = document.getElementById('name');
    var roomInput = document.getElementById('room');
    var serviceInput = document.getElementById('service');
    var messageInput = document.getElementById('message');
    var successBox = document.getElementById('form-success');

    function validateName() {
      var value = nameInput.value.trim();
      if (value === '') return showError(nameInput, 'Please enter your name.'), false;
      if (value.length < 2) return showError(nameInput, 'Name must be at least 2 characters.'), false;
      if (!/^[A-Za-z][A-Za-z .'-]*$/.test(value)) return showError(nameInput, 'Name can only contain letters, spaces and . \' -'), false;
      clearError(nameInput);
      return true;
    }

    function validateRoom() {
      var value = roomInput.value.trim();
      if (value === '') return showError(roomInput, 'Please enter your room number.'), false;
      if (!/^[A-Za-z0-9-]{1,10}$/.test(value) || !/\d/.test(value)) {
        return showError(roomInput, 'Use letters, digits or hyphen, e.g. 204 or A-204.'), false;
      }
      clearError(roomInput);
      return true;
    }

    function validateService() {
      if (serviceInput.value === '') return showError(serviceInput, 'Please select a service.'), false;
      clearError(serviceInput);
      return true;
    }

    function validateMessage() {
      var value = messageInput.value.trim();
      if (value === '') return showError(messageInput, 'Please describe the problem.'), false;
      if (value.length < 10) return showError(messageInput, 'Please give a bit more detail (at least 10 characters).'), false;
      if (value.length > 500) return showError(messageInput, 'Message must be 500 characters or fewer.'), false;
      clearError(messageInput);
      return true;
    }

    /* Live validation once a field has been touched */
    nameInput.addEventListener('blur', validateName);
    roomInput.addEventListener('blur', validateRoom);
    serviceInput.addEventListener('change', validateService);
    messageInput.addEventListener('blur', validateMessage);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (successBox) successBox.hidden = true;

      var valid = [validateName(), validateRoom(), validateService(), validateMessage()].every(Boolean);
      if (!valid) {
        var firstInvalid = form.querySelector('.input-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var requests = loadRequests();
      requests.unshift({
        id: Date.now(),
        name: nameInput.value.trim(),
        room: roomInput.value.trim(),
        service: serviceInput.value,
        message: messageInput.value.trim(),
        date: new Date().toLocaleString()
      });
      saveRequests(requests);

      form.reset();
      if (successBox) {
        successBox.textContent = 'Your request has been saved. Support will follow up on it.';
        successBox.hidden = false;
      }
      renderRequests();
    });
  }

  function renderRequests() {
    var listEl = document.getElementById('request-list');
    var emptyEl = document.getElementById('request-empty');
    if (!listEl) return;

    var requests = loadRequests();
    listEl.innerHTML = '';

    if (emptyEl) emptyEl.hidden = requests.length > 0;

    requests.forEach(function (req) {
      var item = document.createElement('li');
      item.className = 'request-item';

      var header = document.createElement('div');
      header.className = 'request-header';

      var title = document.createElement('strong');
      title.textContent = req.service + ' · Room ' + req.room;

      var deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'request-delete';
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('aria-label', 'Delete request for ' + req.service + ' in room ' + req.room);
      deleteBtn.addEventListener('click', function () {
        deleteRequest(req.id);
      });

      header.appendChild(title);
      header.appendChild(deleteBtn);

      var meta = document.createElement('small');
      meta.textContent = req.name + ' · ' + req.date;

      var body = document.createElement('p');
      body.textContent = req.message;

      item.appendChild(header);
      item.appendChild(meta);
      item.appendChild(body);
      listEl.appendChild(item);
    });
  }

  function deleteRequest(id) {
    var remaining = loadRequests().filter(function (req) {
      return req.id !== id;
    });
    saveRequests(remaining);
    renderRequests();
  }

  /* ---------- Feature 3: Login validation and password toggle ---------- */

  function initLoginForm() {
    var form = document.getElementById('login-form');
    if (!form) return;

    var userInput = document.getElementById('email');
    var passInput = document.getElementById('password');
    var toggleBtn = document.getElementById('toggle-password');
    var statusBox = document.getElementById('login-status');

    function validateUser() {
      var value = userInput.value.trim();
      if (value === '') return showError(userInput, 'Please enter your email or username.'), false;
      if (value.length < 3) return showError(userInput, 'Email or username is too short.'), false;
      clearError(userInput);
      return true;
    }

    function validatePass() {
      if (passInput.value === '') return showError(passInput, 'Please enter your password.'), false;
      if (passInput.value.length < 6) return showError(passInput, 'Password must be at least 6 characters.'), false;
      clearError(passInput);
      return true;
    }

    userInput.addEventListener('blur', validateUser);
    passInput.addEventListener('blur', validatePass);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        var showing = passInput.type === 'text';
        passInput.type = showing ? 'password' : 'text';
        toggleBtn.textContent = showing ? 'Show' : 'Hide';
        toggleBtn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (statusBox) statusBox.hidden = true;

      var valid = [validateUser(), validatePass()].every(Boolean);
      if (!valid) {
        var firstInvalid = form.querySelector('.input-invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      /* No backend in this front-end project, so login cannot be verified. */
      if (statusBox) {
        statusBox.textContent = 'Login form is valid. Authentication is not connected to a server in this front-end version.';
        statusBox.hidden = false;
      }
    });
  }

  /* ---------- Init ---------- */

  document.addEventListener('DOMContentLoaded', function () {
    initContactForm();
    renderRequests();
    initLoginForm();
  });
})();
