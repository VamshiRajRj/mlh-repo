import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {width} from '../utils/Styles';
import {Colors, Icons} from '../utils/Colors';
const HomeDetails = ({idx, item, onPress, onOptionsPress}) => {
  return (
    <View style={styles.container} key={idx}>
      <TouchableOpacity
        style={{flexDirection: 'row'}}
        onPress={() => onPress(item)}>
        <View
          style={[
            styles.statusIconView,
            {backgroundColor: Colors[item?.orderStatus.toLowerCase()]},
          ]}>
          <Image
            source={{uri: Icons[item?.orderStatus.toLowerCase()]}}
            style={styles.statusIcon}
            resizeMode="contain"
          />
        </View>
        <View style={{marginHorizontal: 12}}>
          <Text style={styles.head}>{item?.id}</Text>
          <Text style={styles.subHead}>{item?.createdAt?.substr(0, 10)}</Text>
          {false && (
            <View style={styles.captionView}>
              <Text style={styles.caption}>New</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.optionsView}
        onPress={() => onOptionsPress(item)}>
        <Image
          source={{uri: 'options'}}
          style={styles.options}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

export default HomeDetails;

const styles = StyleSheet.create({
  container: {
    width: width,
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#EFEFF4',
    justifyContent: 'space-between',
  },
  statusIconView: {
    height: 50,
    width: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIcon: {
    height: 21,
    width: 28,
  },
  head: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'Inter-Bold',
    letterSpacing: 0.41,
    color: '#242A37',
    width: width - 120,
  },
  subHead: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    letterSpacing: 0.1,
    width: width - 120,
    lineHeight: 14,
    color: '#000',
    marginTop: 6,
  },
  caption: {
    color: '#45CB85',
    fontSize: 9,
    fontFamily: 'Inter-Regular',
    lineHeight: 11,
    letterSpacing: 0.1,
    textAlign: 'center',
    padding: 3,
  },
  captionView: {
    borderWidth: 0.5,
    borderColor: '#878A99',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  optionsView: {
    height: 50,
    width: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  options: {
    height: 24,
    width: 8,
  },
});
