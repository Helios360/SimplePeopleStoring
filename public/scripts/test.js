const answer = document.getElementById('editor');
const submit = document.getElementById('submit')
const token = localStorage.getItem('token');
submit.addEventListener("click", event => {
  event.preventDefault();
  const token = localStorage.getItem('token');
  const answerText = editor.state.doc.toString();

  fetch('/api/test', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ answer: answerText })
  })
  .then(res => res.json())
  .then(data => {
    console.log(data);
    localStorage.removeItem("code");
    location.reload();
  })
  .catch(err => {
    console.error('Error submitting test:', err);
  });
});


function fetchTest(){
  return 0;
}