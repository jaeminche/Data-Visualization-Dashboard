# Data Visualization Dashboard

### Node.js / PostgreSQL web app with charts and tables

### Originally built with a mock (anonymized) database provided by Activ84health. So these codes may not be in accordance with the real database.

### You can check the preview down below to see the the current phase of the development.

## FOR DEVELOPERS TO CONTINUE BUILDING THE APP

1. Install all the dependencies in package.json
2. Sync the database-related URLs throughout the codes with the database OR your mock database before deployment.
3. Set the client_config in config directory in accordance with your database
4. to run the app - in terminal, 'node app'
5. url to start with - "http://localhost:3000/logged_in_as/4"
   (4 is the superadmin's user id number. You can try it with any id number if there's data for it)
6. and click on the blue button (it may take 60 ~ 90 sec to load the first dashboard page.)

## TODOs

1. See TODOs throughout the codes
2. Finish the algorithm for bisecting the active time into an actual cycling time and a taxi mode time. Right now, it shows the whole time being. After calculating the taximode time, send the data to the second set of the chart's datasets. (Also, make the third dataset where needed)
3. Handle errors such as:
   when there's no data found, (if there's no packet_generated > display anouncement "there's no data", and when period is 'year' or 'week', change date range and chart labels to ones without day and date.
4. Remove TBD files for the mock start screen before deployment
5. Set middleware for authorization in accordance with user/admin/superadmin.
6. Mind front-end features such as users' photo images.
7. Mind Big O : the loading time for the first page for id 4 takes 90 sec (and 70 sec for id 82,) on my laptop.
8. my personal thought on performance : It may be better for performance and maintenance with a data visualization tool like Kibana or Grafana. Only through some changes in data structure in the database because, now, there are a lot of process to make to manipulate the data to get the final result we want, such as the cycling time and taximode time.

- if you have any questions on the existing codes up to the point where I've left off, you can email me at jaeminche@gmail.com.

## BUILT WITH :

- `Node.js`,
- `PostgreSQL`,
- `JavaScript`,
- `Chart.js`,
- `DataTable.js`,
- `jQuery`,
- `AJAX`

## BUILT BY : Jae M. Choi (jaeminche@gmail.com) May 2019 ~ Aug 2019

## PREVIEW :

![preview GIF image](preview.gif)
