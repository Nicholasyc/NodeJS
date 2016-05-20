/**
 * Created by Nicholas_Wang on 2016/3/12.
 */
function route(handle, pathname, response, request) {
    console.log('about to route a requst for' + pathname);
    if (typeof handle[pathname] === "function") {
        handle[pathname](response, request);
    } else {
        console.log('no request for handler found for' + pathname);
        response.writeHead(404, {'Content-Type': 'text/html'});
        response.write('404 not found');
        response.end();
    }
}

exports.route = route;