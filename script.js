function reserver() {
  let nom = document.getElementById("nom").value;
  let date = document.getElementById("date").value;

  if (nom === "" || date === "") {
    alert("Remplis tous les champs !");
    return;
  }

  document.getElementById("message").innerHTML =
    "✅ Réservation confirmée pour " + nom + " le " + date;
}
