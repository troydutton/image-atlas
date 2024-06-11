import { TouchableOpacity, View, Image, FlatList } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-ico-material-design';
import { styles } from './styles/style';

export default function SelectionView({ navigation, route}) {
    const similarGarments = route.params.similarGarments;
    const similarModels = route.params.similarModels;

    const [displayGarments, setDisplayGarments] = useState(true);

    const renderItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => {
                setDisplayGarments(prevState => !prevState);
            }}
        >
            <Image
                key={index}
                style={styles.image}
                source={{ uri: `data:image/jpeg;base64,${displayGarments ? similarGarments[index] : similarModels[index]}` }}
            />
        </TouchableOpacity>
    );
    return (
        <View style={styles.imageViewContainer}>
            <View style={{marginTop: 50, padding: 5}}>
                <TouchableOpacity onPress={() => navigation.navigate('Camera')}>
                    <Icon name="go-back-left-arrow" color="" width="40" height="40"/>
                </TouchableOpacity>
            </View>
            <FlatList
                data={similarGarments}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
                numColumnGarment
                contentContainerStyle={styles.list}
            />
        </View>
    );
  }