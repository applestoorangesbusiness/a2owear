initialize();

async function initialize() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const sessionId = urlParams.get('session_id');
  let cart = JSON.parse(localStorage.getItem("cartCache"));
  const response = await fetch(`${serverURL}/sessionStatus?session_id=${sessionId}`);
  const session = await response.json();
  const date = new Date();

  if (!cart) {
    //DO THIS
    return;
  }

  if (session.status == 'open') {
    window.replace('../html/checkout.html')
  } else if (session.status == 'complete') {
    document.getElementById('success').classList.remove('hidden');
    document.getElementById('customer-email').textContent = session.customer_email;

    await fetch(serverURL + "/newOrder", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.customer_email,
        cart: cart,
        date: {
          month: date.getMonth()+1,
          date: date.getDate(),
          year: date.getFullYear()
        }
      })
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
      })
      .catch((error) => {
        console.error("error.message: " + error.message);
      })

    await fetch(serverURL + '/cart', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: session.customer_email,
      })
    })
      .then(response => {
        return response.json();
      })
      .then(data => {
        return data;
      })
      .catch((error) => {
        console.error("error.message: " + error.message);
      });
  }
}