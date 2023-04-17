import { defineEventHandler, H3Event, parseCookies, setCookie } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
    const data = await readBody(event);
    let savedPalettes: any = getCookie(event, 'saved-palettes');

    if ( data.action === 'set' ) {

        try {

            if ( savedPalettes === undefined ) {
                savedPalettes = [{
                    id: 1,
                    palette: data.palette
                }];
            } else {
                savedPalettes = JSON.parse(savedPalettes);
                const id =  savedPalettes[savedPalettes.length - 1].id + 1

                savedPalettes.push({
                    id,
                    palette: data.palette
                })
            }

            setCookie(event, 'saved-palettes', JSON.stringify(savedPalettes), {
                maxAge: 365 * 24 * 60 * 60
            });

            return {
                status: 200,
                action: 'saved',
                savedPalette: data.palette
            }
            
        } catch(e) {
            throw new Error
        }

    } else if ( data.action === 'delete' ) {

        // if ( savedPalettes === undefined ) {
        //     savedPalettes = [];
        // } else {

        //     savedPalettes = JSON.parse(savedPalettes);

        //     const removeIndex: Number; 
        //     for( let (palette, idx) in savedPalettes ) {
                
        //     }
        // }

    }
});