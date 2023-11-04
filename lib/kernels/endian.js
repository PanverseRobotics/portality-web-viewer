let endianNess = () => {
    let uInt32 = new Uint32Array([0x42000069]);
    let uInt8 = new Uint8Array(uInt32.buffer);
    
    if(uInt8[0] === 0x69) {
        return 'le';
    } else if (uInt8[0] === 0x42) {
        return 'be';
    } else {
        return 'unknown';
    }
};
 
export default endianNess;