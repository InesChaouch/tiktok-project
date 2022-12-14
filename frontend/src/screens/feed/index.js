import React, { useEffect, useRef, useState } from 'react'
import { Dimensions, FlatList, View } from 'react-native'
import useMaterialNavBarHeight from '../../hooks/useMaterialNavBarHeight'
import PostSingle from '../../components/general/post'
import { getFeed, getPostsByUserId } from '../../services/posts'
import styles from './styles'

export default function FeedScreen({ route }) {
    const { setCurrentUserProfileItemInView, creator, profile } = route.params
    const [posts, setPosts] = useState([])
    const mediaRefs = useRef([])

    useEffect(() => {
        if (profile) {
            getPostsByUserId(creator).then(setPosts)
        } else {
            getFeed().then(setPosts)
        }
    }, [])


    const onViewableItemsChanged = useRef(({ changed }) => {
        changed.forEach(element => {
            const cell = mediaRefs.current[element.key]
            if (cell) {
                if (element.isViewable) {
                    if (!profile) {
                        setCurrentUserProfileItemInView(element.item.creator)
                    }
                    cell.play()
                } else {
                    cell.stop()
                }
            }

        });
    })

    const feedItemHeight = Dimensions.get('window').height - useMaterialNavBarHeight(profile);

    const renderItem = ({ item, index }) => {
        return (
            <View style={{ height: feedItemHeight, backgroundColor: 'black' }}>
                <PostSingle item={item} ref={PostSingleRef => (mediaRefs.current[item.id] = PostSingleRef)} />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={posts}
                windowSize={4}
                initialNumToRender={0}
                maxToRenderPerBatch={2}
                removeClippedSubviews
                viewabilityConfig={{
                    itemVisiblePercentThreshold: 0
                }}
                renderItem={renderItem}
                pagingEnabled
                keyExtractor={item => item.id}
                decelerationRate={'normal'}
                onViewableItemsChanged={onViewableItemsChanged.current}
            />
        </View>
    )
}
