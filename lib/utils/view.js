
function getRadius(viewParams){
    let ep = viewParams.eyePosition;
    let fp = viewParams.focusPosition;

    return Math.sqrt((ep[0] - fp[0]) ** 2 + (ep[1] - fp[1]) ** 2 + (ep[2] - fp[2]) ** 2);
}

function viewUpdateEyePosition(radius, az, elev, offs) {
    let x = radius * Math.cos(az) * Math.cos(elev) + offs[0];
    let z = radius * Math.sin(az) * Math.cos(elev) + offs[2];
    let y = radius * Math.sin(elev) + offs[1];

    return [x,y,z];
}

function viewTiltRoll(event, lastMousePosition, viewParams) {
    // with left click, spin around the focus position
    let dx = event.clientX - lastMousePosition[0];
    let dy = event.clientY - lastMousePosition[1];
    viewParams.azimuth -= dx / viewParams.lookSensitivity;
    viewParams.elevation -= dy / viewParams.lookSensitivity;

    // Clamp the elevation to [-pi/2, pi/2]
    viewParams.elevation = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, viewParams.elevation));
    //console.log(eyePosition)

    viewParams.eyePosition = viewUpdateEyePosition(viewParams.radius, viewParams.azimuth, viewParams.elevation, viewParams.focusPosition);
}

function viewDolly(event, lastMousePosition, viewParams){
    viewParams.radius = getRadius(viewParams);

    // with middle click, zoom in and out
    let dx = event.clientX - lastMousePosition[0];
    let dy = event.clientY - lastMousePosition[1];
    viewParams.radius += dy / lookSensitivity;

    // clamp the radius 
    viewParams.radius = Math.max(0.1, Math.min(30, radius));

    viewParams.eyePosition = viewUpdateEyePosition(viewParams.radius, viewParams.azimuth, viewParams.elevation, viewParams.focusPosition);
}



function viewPan(event, lastMousePosition, viewParams){
    // with right click, move the focus position
    let dx = event.clientX - lastMousePosition[0];
    let dy = event.clientY - lastMousePosition[1];
    // move the focus position around on the surface of a sphere
    // internal elevation is just negative elevation
    viewParams.elevation -= dy / viewParams.lookSensitivity;

    // Clamp the elevation to [-pi/2, pi/2]
    viewParams.elevation = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, viewParams.elevation));
    viewParams.azimuth -= dx / viewParams.lookSensitivity;

    viewParams.focusPosition = viewUpdateEyePosition(viewParams.radius, (viewParams.azimuth + Math.PI) % (2 * Math.PI), -viewParams.elevation, viewParams.eyePosition);
}

function viewMoveMouse(event, lastMousePosition, viewParams){
    if (event.buttons == 1) {
        viewTiltRoll(event, lastMousePosition, viewParams);
    } else if (event.buttons == 4) {
        viewDolly(event, lastMousePosition, viewParams);
    } else if (event.buttons == 2) {
        viewPan(event, lastMousePosition, viewParams);
    }

    
}


function viewDollyWheel(event, viewParams){
    viewParams.radius += event.deltaY / 100;

    // clamp the radius to [0, 10]
    viewParams.radius = Math.max(0.1, Math.min(30, viewParams.radius));
    
    // update eye positions with new radius
    viewParams.eyePosition = viewUpdateEyePosition(viewParams.radius, viewParams.azimuth, viewParams.elevation, viewParams.focusPosition);
}

export { viewMoveMouse, viewDollyWheel };