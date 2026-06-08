<?php
$conn = new mysqli("localhost", "root", "", "sistema");

$email = $_POST['email'];
$senha = $_POST['senha'];

$sql = "SELECT * FROM usuarios 
        WHERE email='$email' 
        AND senha='$senha'";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "Login realizado";
} else {
    echo "Usuário inválido";
}
?>