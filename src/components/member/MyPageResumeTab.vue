<template>
  <b-tab title="나의 이력서 관리" >
    <!-- {{memberInfo}} -->
    <h3>
      <span id="mypageNickname">{{ memberInfo.memberNickname }}</span> 님의
      이력서
    </h3>
    <br />
    <div>
      {{ memberInfo.memberNickname }} 님의 이력서 :
      {{
        memberDetail.memberResume
          ? memberDetail.memberResume.resumeFilename
          : ""
      }}
      <br /><br />
      이력서 올린 날짜:
      {{
        memberDetail.memberResume
          ? memberDetail.memberResume.resumeUpdatedAt
          : ""
      }}
      <br /><br />
        <div class="resumeOpenContainor">
        이력서 공개 여부:

          <input type="radio" name="resumeOpen" value="true" v-model="isOpen" />공개
          <input type="radio"  name="resumeOpen"  value="false"  v-model="isOpen" />비공개 
          <b-button @click="updateOpenVal"  class="btn-sm">확인</b-button> <br><br>
      </div>

    <b-form-file
      v-model="resumeFile"
      :state="Boolean(resumeFile)"
      placeholder="업로드할 이력서를 선택해주세요."
      drop-placeholder="이곳에 이력서 드래그"
    ></b-form-file>
    <div class="resumeButtonContainer">
      <b-button @click="uploadResume" style="margin-right: 10px"
        >업로드</b-button
      >
      <b-button @click="getResume">이력서 다운로드</b-button>
    </div>

  
    </div>
  </b-tab>
</template>

<script>
import dayjs from "dayjs";

export default {
  name: "ResumeTab",
  data() {
    return {
      file: null,
      imgUrl: "",
      resumeFile: null,
      isOpen: false,
      updateOpenResult: {
        success: null
      }
    };
  },
  computed: {
    memberInfo() {
      return this.$store.getters["auth/memberInfo"];
    },
    memberDetail() {
      const memberDetailRaw = this.$store.getters["member/memberDetail"];

      if (Object.keys(memberDetailRaw).length === 0) {
        return memberDetailRaw;
      }

      return {
        ...memberDetailRaw,
        memberResume: {
          ...memberDetailRaw.memberResume,
          resumeUpdatedAt: dayjs
            .unix(memberDetailRaw.memberResume.resumeUpdatedAt / 1000)
            .format("YYYY년 MM월 DD일"),
        },
      };
    },
  },
  watch: {
    'updateOpenResult.success': {
      handler(val) {
        if (val === true) {
          this.loadMemberDetail();
          this.updateOpenResult.success = null;
        } else if (val === false) {
          alert('오류가 발생했습니다.');
          this.updateOpenResult.success = null;
        }
      }
    }
  },
  methods: {
    loadMemberDetail() {
      this.$store.dispatch('auth/authRequest', {
        requestCallback: () => {
          this.$store.dispatch('member/getMemberById', this.memberInfo.memberId);
        },
        failedCallback: (error) => {
          console.error('실패');
          console.error(error);
          this.$store.commit('common/setSuccess', false);
        }
      });
    },
    updateOpenVal() {
      this.$store.dispatch("auth/authRequest", {
        requestCallback: () => {
          console.log(this.isOpen, this.memberInfo.memberId);
          this.$store.dispatch("member/editResumeOpen", {
              resumeOpen: this.isOpen,
              memberId: this.memberInfo.memberId,
              resultRef: this.updateOpenResult
            });
        },
        failedCallback: (error) => {
          console.error("실패");
          console.error(error);
          this.$store.commit("common/setSuccess", false);
        },
      });
    },
    uploadResume() {
      this.$axios
        .postForm(
          // `${this.$apiUri.member}/${this.memberInfo.memberId}/resume`,
          `${this.$apiUri.member}/resume`,
          {
            file: this.resumeFile,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${this.$store.getters["auth/accessToken"]}`,
            },
          }
        )
        .then((result) => {
          console.log(result);
          this.loadMemberDetail();
        })
        .catch((result) => {
          console.error(result);
        });
    },
    getResume() {
      this.$axios
        .get(`${this.$apiUri.member}/${this.memberInfo.memberId}/resume`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${this.$store.getters["auth/accessToken"]}`,
          },
          responseType: "blob",
        })
        .then((response) => {
          const blob = new Blob([response.data]);
          const fileObjectUrl = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = fileObjectUrl;
          link.style.display = "none";

          const disposition = response.headers["content-disposition"];
          console.log(response.headers);
          link.download = decodeURI(
            disposition
              .match(/fileName[^;=\n]*=((['"]).*?\2|[^;\n]*)/)[1]
              .replace(/['"]/g, "")
          );

          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(fileObjectUrl);
        })
        .catch((response) => {
          console.error(response);
          alert("이력서 다운로드에 실패했습니다.");
        });
    },
  },
};
</script>
<style scoped>
#mypageNickname{
 font-weight: 900;
}
.resumeButtonContainer {
    margin-top: 60px;
    display: flex;
    justify-content: center; 
}
</style>
