<html>
<head>
    <title>PHP Test</title>
</head>
<body>
    <datalist id="mylist">
        <option value="Zach Henry">
        <option value="Zach Dat">
        <option value="Option 3">
    </datalist>
    <input type="search" list="mylist" placeholder="Enter Student's Name" >
<?php
$password = 'userpass';
echo password_hash($password, PASSWORD_DEFAULT) . "\n";
?>
</body>
</html>