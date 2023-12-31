import axios from 'axios';
import apiUri from '@/apiUri.js';
import router from '@/router';

export default {  namespaced: true,
  state: {
    registerInfo: {
      currentStep: 1,
      memberActive: true
    },
    memberDetail: { },
    resumeOpen: false
  },
  getters: {
    registerInfo(state) {
      return state.registerInfo;
    },
    memberDetail(state) {
      return state.memberDetail;
    }
  },
  mutations: {
    nextRegisterStep(state) {
      state.registerInfo.currentStep += 1;
    },
    prevRegisterStep(state) {
      if (state.registerInfo.currentStep <= 1) { // 1단계 이전으로는 갈 수 없다
        return;
      }
      state.registerInfo.currentStep -= 1;
    },
    setRegisterMemberType(state, memberType) {
      state.registerInfo.memberType = memberType;
    },
    setRegisterInfo(state, registerInfoParam) {
      state.registerInfo = { // 전개 연산자 사용하여 값을 대체하지 않고 추가
        ...state.registerInfo,
        ...registerInfoParam
      };
    },
    setMemberDetail(state, memberDetailParam) {
      state.memberDetail = memberDetailParam;
    }
  },
  actions: {
    register({ commit, getters }) { // 회원가입 요청
      console.log('회원가입 요청 시작');
      axios.post(
        apiUri.signin,
        getters.registerInfo
      )
        .then(() => {
          commit('common/setRegisterInfo', { currentStep: 1, memberActive: true }, { root: true });
          commit('common/setSuccess', true, { root: true });
        })
        .catch((error) => {
          console.error(error);
          commit('common/setSuccess', false, { root: true });
        });
    },
    editMemberInfo({ commit, rootGetters }, memberInfo) { // 회원가입 요청
      console.log('회원정보 수정 요청 시작');
      axios.put(
        `${apiUri.member}/${memberInfo.memberId}`,
        memberInfo,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${rootGetters['auth/accessToken']}`
          }
        }
      )
        .then(() => {
          commit('common/setSuccess', true, { root: true });
          alert('회원정보 수정에 성공했습니다.\n다시 로그인해주세요.');
          router.push({ name: 'logout' });
        })
        .catch((error) => {
          console.error(error);
          commit('common/setSuccess', false, { root: true });
        });
    },
    checkExistMember({ commit }, memberId) { // ID 중복검사
      console.log('아이디 중복검사 요청 시작');
      console.log(`${apiUri.member}/exist/${memberId}`);
      axios.get(`${apiUri.member}/exist/${memberId}`)
        .then((result) => {
          console.log(result);
          if (result.data.success) { // 중복이 아닐 때
            commit('setMemberDetail', { memberId });
          } else { // 중복일때
            commit('setMemberDetail', { });
          }
        })
        .catch((error) => {
          console.error(error);
        });
    },
    getMemberById({ commit, rootGetters }, memberId) { // ID 회원 조회
      console.log('회원조회 요청 시작');
      axios.get(`${apiUri.member}/${memberId}`,
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${rootGetters['auth/accessToken']}`
        }
      })
        .then((result) => {
          console.log(result);
          commit('setMemberDetail', result.data.payload);
          commit('common/setSuccess', true, { root: true });
        })
        .catch((error) => {
          console.error(error);
          commit('common/setSuccess', false, { root: true });
        });
    },
    //이력서 공개여부 수정
    editResumeOpen({ commit, rootGetters },{memberId,resumeOpen, resultRef}) { // 회원가입 요청
      axios.put(
        `${apiUri.member}/resume/${memberId}`,
        {
          resumeOpen
        }
        ,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${rootGetters['auth/accessToken']}`
          }
        }
      )
        .then(() => {
          resultRef.success = true;
          alert('회원 이력서 공개 여부를 수정하였습니다.');
        })
        .catch((error) => {
          resultRef.success = false;
          console.error(error);
          commit('common/setSuccess', false, { root: true });
        });
    },
    getCompanyMemberById({ commit, rootGetters }, memberId) { // ID 회원 조회
      console.log('회원조회 요청 시작');
      axios.get(`${apiUri.member}/${memberId}`,
      {
        withCredentials: true,
        params: {
          isCompany: true
        },
        headers: {
          Authorization: `Bearer ${rootGetters['auth/accessToken']}`
        }
      })
        .then((result) => {
          console.log(result);
          commit('setMemberDetail', result.data.payload);
          commit('common/setSuccess', true, { root: true });
        })
        .catch((error) => {
          console.error(error);
          commit('common/setSuccess', false, { root: true });
        });
    }
  }
};
