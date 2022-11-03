import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import styles from "./styles";
import { Ionicons } from "@expo/vector-icons";
import { getLikeById, updateLike } from "../../../../services/posts";
import { useDispatch, useSelector } from "react-redux";
import { throttle } from "throttle-debounce";
import { openCommentModal } from '../../../../redux/actions/modal';
import { useNavigation } from '@react-navigation/core';

export default function PostSingleOverlay({ user, post }) {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const [currentLikeState, setCurrentLikeState] = useState({
    state: false,
    counter: post.likesCount,
  });

  useEffect(() => {
    getLikeById(post.id, currentUser.uid).then((res) => {
      setCurrentLikeState({
        ...currentLikeState,
        state: res,
      });
    });
  }, []);


  const handleUpdateLike = useMemo(
    () =>
      throttle(500, true, (currentLikeStateInst) => {
        setCurrentLikeState({
          state: !currentLikeStateInst.state,
          counter:
            currentLikeStateInst.counter +
            (currentLikeStateInst.state ? -1 : 1),
        });
        updateLike(post.id, currentUser.uid, currentLikeStateInst.state);
      }),
    []
  );

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.displayName}>{user?.displayName}</Text>
        <Text style={styles.description}>{post.description}</Text>
      </View>

      <View style={styles.leftContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('profileOther', { initialUserId: user?.uid })}>
          <Image style={styles.avatar} source={{ uri: user?.photoURL }} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleUpdateLike(currentLikeState)}
        >
          <Ionicons
            color="white"
            size={40}
            name={currentLikeState.state ? "heart" : "heart-outline"}
          />
          <Text style={styles.actionButtonText}>
            {currentLikeState.counter}
          </Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => dispatch(openCommentModal(true, post))}
        >
          <Ionicons
            color="white"
            size={40}
            name={"chatbubble"}
          />
          <Text style={styles.actionButtonText}>
            {post.commentsCount}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
