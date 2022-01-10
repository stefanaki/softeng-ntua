let alerts = document.querySelector('#alerts');
let usernameInput = document.querySelector('#usernameInput');
let passwordInput = document.querySelector('#passwordInput');
let submitButton = document.querySelector('#submitBtn');
let msg = localStorage.getItem('msg');

if (localStorage.getItem('auth_token')) {
	window.location.replace('/');
}

const createAlert = (msg, type) => {
	let alert = document.createElement('div');
	alert.classList.add(
		'my-alert',
		'alert',
		'alert-dismissible',
		`alert-${type}`,
		'hide',
		'fade',
		'in',
		'mt-3'
	);
	alert.innerHTML = `
            ${msg}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
	alerts.appendChild(alert);

	setTimeout(() => {
		alert.classList.remove('hide');
		alert.classList.add('show');
		setTimeout(() => {
			alert.classList.remove('show');
			alert.classList.add('hide');
		}, 3000);
		setTimeout(() => alert.remove(), 3600);
	}, 0);
};

if (msg) {
	msgObj = JSON.parse(msg);
	createAlert(msgObj.msg, msgObj.type);
	localStorage.removeItem('msg');
}

submitButton.addEventListener('click', async (e) => {
	e.preventDefault();
	submitButton.innerHTML = `
        <div class="spinner-border spinner-border-sm text-light" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>`;
	let username = usernameInput.value;
	let password = passwordInput.value;
	if (!username || !password) {
		submitButton.innerHTML = 'Log in';
		createAlert('Specify both username and password', 'info');
	} else
		try {
			let res = await axios({
				method: 'post',
				url: 'https://localhost:9103/interoperability/api/login',
				headers: {
					'content-type': 'application/x-www-form-urlencoded'
				},
				data: new URLSearchParams({ username, password })
			});

			localStorage.setItem('auth_token', res.data.token);

			submitButton.classList.remove('btn-primary');
			submitButton.classList.add('btn-success');
			submitButton.innerHTML = `Welcome back, ${username}`;
			setTimeout(() => window.location.replace('/'), 2000);
		} catch (error) {
			submitButton.innerHTML = `Log in`;
			if (error.response && error.response.status === 401) {
				createAlert('Invalid credentials', 'danger');
			} else {
				createAlert('Network error', 'danger');
			}
		}
});
