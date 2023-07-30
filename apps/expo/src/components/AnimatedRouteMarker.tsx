import { useState, useRef, useCallback, useEffect, memo } from 'react'
import { type LatLng } from 'react-native-maps';

import { getDirections } from '../utils/helpers';
import AnimatedMarker from './AnimatedMarker';

const AnimatedRouteMarker = () => {

    const anim_route_ref = useRef<LatLng[]>([])
    const route_count_ref = useRef(0);
    const [current_coords, set_current_coords] = useState<{ latitude: number, longitude: number }>({
        latitude: 23.1218644,
        longitude: -82.32806211,
    });


    const _getLiveLocation = useCallback(() => {
        if (anim_route_ref.current.length !== route_count_ref.current) {
            console.log('locationCount: ', anim_route_ref.current.length.toString() + ' - ' + 'count: ', route_count_ref.current);

            const latitude = anim_route_ref.current[route_count_ref.current + 1]?.latitude;
            const longitude = anim_route_ref.current[route_count_ref.current + 1]?.longitude;
            route_count_ref.current = route_count_ref.current + 1

            if (!latitude || !longitude) {
                return
            }

            set_current_coords({ latitude, longitude });

        } else {
            route_count_ref.current = 0
        }
    }, [anim_route_ref, route_count_ref])


    useEffect(() => {

        void (async () => {
            const new_direction = await getDirections("23.1218644,-82.32806211", "23.1118644,-82.31806211")
            anim_route_ref.current = new_direction === undefined ? [] : new_direction
            console.log('anim route setted')
        }
        )()

        console.log('setting interval')
        const interbal_sub = setInterval(() => {
            _getLiveLocation()
        }, 3000)

        return () => {
            console.log('clearing interval')
            clearInterval(interbal_sub)
        }

    }, [_getLiveLocation])

    return (
        <>
            {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                anim_route_ref.current.length > 0 && <AnimatedMarker latitude={current_coords.latitude} longitude={current_coords.longitude} />
            }
        </>
    )
}

export default memo(AnimatedRouteMarker)