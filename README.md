# <center>attendancesystem</center>
There are three processes that need to be runnnin in order to use the application: the database server, the php server, and the React frontend. The instructions for starting each of them are described below in order.
## Database (MYSQL Database using XAMPP)
In order to get the server running, you can simply start the MYSQL Server from XAMPP or MYSQL Workbench. You will need to upload init.sql to those servers and run the script for the application to work correctly.
## PHP Server
You can run the server in the terminal using the following command (ensure that you're in the SemesterProject directory):

php -S localhost:8000 -t phpserver/ (php server file must be named index.php for this to work)

Make sure that you navigate to the phpserver folder first before running it.

## React application
To run this, navigate to the attendancesystem folder and simply run the following command:

npm start

You may need to run npm i first in order to ensure that all of the necessary packages are installed.