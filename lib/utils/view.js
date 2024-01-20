
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

function viewKeyMove(event, viewParams){


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
    // with right click, translate the focus and eye positions in a plane defined by the eye, focus, and up vector
    let dx = event.clientX - lastMousePosition[0]/lookSensitivity;
    let dy = event.clientY - lastMousePosition[1]/lookSensitivity;
    // find the vector from the eye to the focus
    let eyeToFocus = [viewParams.focusPosition[0] - viewParams.eyePosition[0], viewParams.focusPosition[1] - viewParams.eyePosition[1], viewParams.focusPosition[2] - viewParams.eyePosition[2]];
    // find the vector perpendicular to the eyeToFocus vector and the up vector
    let right = [eyeToFocus[1] * viewParams.up[2] - eyeToFocus[2] * viewParams.up[1], eyeToFocus[2] * viewParams.up[0] - eyeToFocus[0] * viewParams.up[2], eyeToFocus[0] * viewParams.up[1] - eyeToFocus[1] * viewParams.up[0]];
    // normalize the right vector
    let rightNorm = Math.sqrt(right[0] ** 2 + right[1] ** 2 + right[2] ** 2);
    right = [right[0] / rightNorm, right[1] / rightNorm, right[2] / rightNorm];
    // normalize the vector from the eye to the focus
    let eyeToFocusNorm = Math.sqrt(eyeToFocus[0] ** 2 + eyeToFocus[1] ** 2 + eyeToFocus[2] ** 2);
    eyeToFocus = [eyeToFocus[0] / eyeToFocusNorm, eyeToFocus[1] / eyeToFocusNorm, eyeToFocus[2] / eyeToFocusNorm];
    // translate the focus position by dx * right + dy * eyeToFocus
    viewParams.focusPosition = [viewParams.focusPosition[0] + dx * right[0] + dy * eyeToFocus[0], viewParams.focusPosition[1] + dx * right[1] + dy * eyeToFocus[1], viewParams.focusPosition[2] + dx * right[2] + dy * eyeToFocus[2]];
    // translate the eye position by dx * right + dy * eyeToFocus
    viewParams.eyePosition = [viewParams.eyePosition[0] + dx * right[0] + dy * eyeToFocus[0], viewParams.eyePosition[1] + dx * right[1] + dy * eyeToFocus[1], viewParams.eyePosition[2] + dx * right[2] + dy * eyeToFocus[2]];
}

function viewStrafe(event, lastMousePosition, viewParams){
    // with right click, move both the eye and focus in a plane defined by the eye, focus, and up vector
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
        viewStrafe(event, lastMousePosition, viewParams);
        // formerly viewPan
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