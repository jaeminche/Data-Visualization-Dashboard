Activ84Health Explorer logging overview

#What can we do with these logs:
How many people logged in this week/ per day: log_login
How long each account cycled: all start cycling from log_startcycling and all times from log_cycling_packets, then remove the large gaps)
Did somebody switch language often (Send mail to explain language system): log_langchange
Are the turning buttons used often?
What dashboard is used?
Do a lot of people press help?

#How to reconstruct a cycling session, preplanned route or not:
Route start from log_startcycling  
Get all turns from log_cycling arrowsAtCN
Extra information:
When taximode
When actually cycling (With RPM sensor)
Speed on intervals
How long did it take to choose a direction

#What do we log (Per table):

##login (log_login):

- Login (Nothing to org or user login)
- org to user
- user to org
- Logout (org to nothing)

##language changes (log_langchange):

- Any manual language changes

##user starts cycling (log_startcycling):

- If they go to a link on /cycling/
- Click on the map and start
- Start a route
- Start at a startlocation

##A number of events (log_events):

- When the user changes to another dashboard
- When a user clicks help
- When the user does or does not allow for its location to be accesed (Not in Android!)
- When a start location or route is edited
- When a the map on choose start location pans to a new location

##Everything during cycling:

###To know when somebody is cycling (log_cycling_packets):

- Whenever a batch of cycling logs is send over the arrival time, user, org and ip is logged.

###To recreate the complete route of the user the following is logged (log_cycling):

- When the user is shown arrows
- When a direction is chosen automatically or by the user
- An average of the rpm is send over the period between each batch of cycling logs
- When the user uses the buttons to turn his/her view
- When taximode is turned on or off.
- When movevement is detected or stops from the RPM sensor.

###Format of logs in log_cycling event_data:

taximodebutton | {"on": false, "type": "button"}
arrowsAtCN | {"degrees": 192.09, "actionType": "ARROW_CHOICE_NODE"}
{"degrees": 18, "actionType": "ARROW_CHOICE_NODE"}
{"actionType": "END_CN_ARROWS"}
turningNoCN | {"degrees": 45, "blockAllMovement": false}
RPMavg | {"RPMavg": null, "RPMavgavg": null, "TotalTime": 0}
moving | {"on": false, "type": "android"}
