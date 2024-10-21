import {StyleSheet, Text, View, Image} from 'react-native';
import React, {useEffect} from 'react';
import {width} from '../../utils/Styles';

import {updateUser} from '../../redux/actions';
import {connect} from 'react-redux';
const ProfileScreen = props => {
  const {myDetails} = props;
  // useEffect(() => {
  //   let mounted = true;

  //   if (mounted) {
  //     console.log(props?.myDetails);
  //   }
  //   return () => {
  //     mounted = false;
  //   };
  // }, []);
  const Row = ({head, val}) => {
    return (
      <View style={styles.row}>
        <Text style={styles.head}>{head} :</Text>
        <Text style={styles.value}>{val}</Text>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
          }}
          style={styles.profile}
        />
        <Text style={styles.profileName}>{myDetails?.name}</Text>
        <Text style={styles.profileEmail}>{myDetails?.email}</Text>
      </View>
      <View style={styles.details}>
        <Row head={'Company'} val={'India Mines'} />
        <Row head={'Name'} val={myDetails?.name} />
        <Row head={'Role'} val={myDetails['custom:role']} />
        <Row head={'Status'} val={'ACTIVE'} />
        <Row head={'Email'} val={myDetails?.email} />
        <Row head={'Mobile'} val={myDetails?.phone_number} />
        <Row head={'Notifications'} val={'ENABLED'} />
        <Row head={'Created On'} val={'Mar 10, 2023'} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
  },
  profile: {
    height: width * 0.5,
    width: width * 0.5,
    borderRadius: width * 0.5,
    marginTop: 12,
  },
  profileName: {
    width: width,
    textAlign: 'center',
    color: '#000',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginTop: 18,
  },
  profileEmail: {
    width: width,
    textAlign: 'center',
    color: '#000',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  details: {
    marginTop: 18,
    padding: width * 0.025,
  },
  row: {
    flexDirection: 'row',
    marginTop: 18,
  },
  head: {
    width: width * 0.35,
    fontSize: 15,
    fontFamily: 'Inter-SemiBold',
    lineHeight: 18,
    letterSpacing: 0.42,
  },
  value: {
    width: width * 0.55,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    lineHeight: 18,
    letterSpacing: 0.42,
  },
});

const mapStateToProps = state => ({
  myDetails: state?.user?.myDetails,
});

export default connect(mapStateToProps, {
  updateUser,
})(ProfileScreen);
