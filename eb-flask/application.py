

from flask import Flask, request, redirect, url_for
import requests
from geolib import geohash

ticket_key = 'vu7g5oyBqql5YmRuHrRq2uaKMdMuttBD'
google_key = 'AIzaSyCxMDQd7bL84qZidWOdbTnNoVzlEW1H9oo'

segmentIds = {
    'Music': 'KZFzniwnSyZfZ7v7nJ',
    'Sports': 'KZFzniwnSyZfZ7v7nE',
    'Arts': 'KZFzniwnSyZfZ7v7na',
    'Theatre': 'KZFzniwnSyZfZ7v7na',
    'Film': 'KZFzniwnSyZfZ7v7nn',
    'Miscellaneous': 'KZFzniwnSyZfZ7v7n1',
}

# print a nice greeting.
def say_hello(username = "World"):
    return '<p>Hello %s!</p>\n' % username

# some bits of text for the page.
header_text = '''
    <html>\n<head> <title>EB Flask Test</title> </head>\n<body>'''
instructions = '''
    <p><em>Hint</em>: This is a RESTful web service! Append a username
    to the URL (for example: <code>/Thelonious</code>) to say hello to
    someone specific.</p>\n'''
home_link = '<p><a href="/">Back</a></p>\n'
footer_text = '</body>\n</html>'

# EB looks for an 'application' callable by default.
application = Flask(__name__)

# add a rule for the index page.
@application.route("/")
def home():
    # return header_text + say_hello() + instructions + footer_text
    return redirect(url_for('static', filename='index.html'))

# add a rule when the page is accessed with a name appended to the site
# URL.
# application.add_url_rule('/<username>', 'hello', (lambda username:
#     header_text + say_hello(username) + home_link + footer_text))


@application.route('/events/')
def events():
    keyword = request.args.get('keyword', '')
    keyword = keyword.replace(" ", "+")
    distance = request.args.get('distance', '10')
    if distance == '':
        distance = 10
    category = request.args.get('category', '')
    lat = request.args.get('lat', '40.4251')
    lng = request.args.get('lng', '74.021')
    geo_hash = geohash.encode(lat, lng, 7)
    print("query events lat:", lat, "lng", lng, "geohash", geo_hash)

    segmentId = ''
    if category in segmentIds:
        segmentId = segmentIds.get(category)

    paramStr = f'radius={distance}&unit=miles&keyword={keyword}' 
    if segmentId != '':
        paramStr = paramStr + f'&segmentId={segmentId}'

    # geo_hash = '9q5cs6c'
    paramStr = paramStr + f'&geoPoint={geo_hash}'
    return events_search(paramStr)
    # return rrrr
    # return '{}'

def events_search(paramStr):
    url = f'https://app.ticketmaster.com/discovery/v2/events.json?apikey={ticket_key}&' + paramStr
    # url = f'https://app.ticketmaster.com/discovery/v2/events.json?apikey={ticket_key}&keyword=Taylor Swift&segmentId=&radius=15&unit=miles&geoPoint=9q5cs6c'
    # url = f'https://app.ticketmaster.com/discovery/v2/events.json?apikey=vu7g5oyBqql5YmRuHrRq2uaKMdMuttBD&radius=15&unit=miles&keyword=Taylor+Swift&segmentId=KZFzniwnSyZfZ7v7nJ&geopoint=9q5cs6c'
    print('events search url:', url)
    resp = requests.get(url)
    content = resp.text
    # print('content is: ', content)
    return content

@application.route('/detail/')
def detail():
    eventId = request.args.get('id', '')
    url = f'https://app.ticketmaster.com/discovery/v2/events/{eventId}.json?apikey={ticket_key}&'
    resp = requests.get(url)
    content = resp.text
    return content

@application.route('/venue/')
def venue():
    name = request.args.get('name', '')
    print('query venue name:', name)
    url = f'https://app.ticketmaster.com/discovery/v2/venues?apikey={ticket_key}&keyword=' + name
    resp = requests.get(url)
    content = resp.text
    return content

# run the app.
if __name__ == "__main__":
    # Setting debug to True enables debug output. This line should be
    # removed before deploying a production app.
    application.debug = True
    application.run()


