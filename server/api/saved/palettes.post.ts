import { defineEventHandler, H3Event, parseCookies, setCookie, deleteCookie } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
    const data = await readBody(event);
    let savedPalettes: any = getCookie(event, 'saved-palettes');

    if ( data.action === 'set' ) {

        try {

            if ( savedPalettes === undefined || savedPalettes === '' ) {
                savedPalettes = [{
                    id: 1,
                    palette: data.palette
                }];
            } else {
                savedPalettes = JSON.parse(savedPalettes);
                const id = savedPalettes.length > 0 ? savedPalettes[savedPalettes.length - 1].id + 1 : 1;

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
            return {
                status: 400,
                action: 'Something went wrong while saving palette!'
            }
        }

    } else if ( data.action === 'delete' ) {

        try {

            let removed = false;

            if ( savedPalettes === undefined || savedPalettes === '' ) {
                deleteCookie(event, 'saved-palettes');
                removed = true;
            } else {
    
                savedPalettes = JSON.parse(savedPalettes);

                if ( savedPalettes.length === 1 ) {
                    deleteCookie(event, 'saved-palettes');
                } else {

                    for ( const [idx, palette] of savedPalettes.entries() ) {
                        if ( savedPalettes[idx].palette === data.palette ) {
                            savedPalettes.splice(idx, 1);
                            removed = true;
                        }
                    }

                    savedPalettes = JSON.stringify(savedPalettes);
                    
                    setCookie(event, 'saved-palettes', savedPalettes, {
                        maxAge: 365 * 24 * 60 * 60
                    });

                }

                return {
                    status: 200,
                    action: 'unsaved'
                }

            }

        } catch(e) {
            return {
                status: 400,
                action: 'Something went wrong while unsaving palette!'
            }
        }

    }
});