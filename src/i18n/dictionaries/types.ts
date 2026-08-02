export interface Dictionary {
  common: { loading: string; save: string; cancel: string };
  auth: {
    title: string; subtitle: string; phoneLabel: string; phonePlaceholder: string;
    passwordLabel: string; loginButton: string; loggingIn: string; errorInvalid: string;
    errorDeviceMismatch: string; errorRateLimited: string; deviceOwnConfirm: string; noAccount: string;
  };
  topbar: { admin: string; student: string; logout: string };
  dashboard: {
    welcome: string; welcomeDesc: string;
    modules: {
      bosqichli: {
      title: string; desc: string; addTopicButton: string; topicDialogTitle: string;
      topicNameLabel: string; topicsEmpty: string; backToTopics: string; linkQuestionsButton: string;
      linkDialogTitle: string; searchPlaceholder: string; bankEmpty: string; linkedBadge: string;
      unlinkButton: string; linkButton: string; deleteTopicConfirm: string; linkedQuestionsTitle: string;
      linkedEmpty: string;
    };
    talim: { title: string; desc: string };
      variantli: { title: string; desc: string };
      bosqichli: { title: string; desc: string };
      yakuniy: { title: string; desc: string };
    };
    profileTitle: string; saved: string; mistakes: string; questionsCountSuffix: string;
  };
  admin: {
    panelTitle: string;
    nav: { dashboard: string; students: string; questions: string; statistics: string };
    stats: { totalStudents: string; totalQuestions: string; testsTaken: string; averageScore: string };
    overviewTitle: string; overviewDesc: string;
    weeklyActivity: string; scoreDistribution: string; passLabel: string; failLabel: string;
    topVariants: string; recentResults: string; colStudent: string; colModule: string;
    colScore: string; colDate: string; noData: string;
    settings: {
      title: string; profileTitle: string; nameLabel: string; emailLabel: string; emailTakenError: string; passwordLabel: string;
      saveButton: string; saveSuccess: string; saveError: string; systemTitle: string; systemDesc: string; contactTitle: string; contactDesc: string; adminPhoneLabel: string; adminTelegramLabel: string; instagramLabel: string; telegramChannelLabel: string;
    };
    adminStudentHistory: {
      title: string; backToStudents: string; historyTitle: string; viewButton: string; colStudent: string;
    };
    students: {
      title: string; desc: string; addButton: string; searchPlaceholder: string;
      colName: string; colPhone: string; colGroup: string; colDevice: string; colActions: string;
      deviceLinked: string; deviceNotLinked: string; resetDevice: string; resetConfirm: string;
      resetSuccess: string; resetError: string; dialogTitle: string; dialogNameLabel: string;
      dialogPhoneLabel: string; dialogGroupLabel: string; dialogPasswordLabel: string;
      dialogSubmit: string; dialogSubmitting: string; createSuccess: string; createError: string;
      empty: string; editButton: string; deleteButton: string; deleteConfirm: string;
      deleteSuccess: string; deleteError: string; editDialogTitle: string; editSuccess: string;
      editError: string; dialogPasswordOptionalLabel: string;
    };
    talim: {
      title: string; desc: string; addStageButton: string; stageDialogTitle: string;
      stageNameLabel: string; stageDescLabel: string; stagesEmpty: string; backToStages: string;
      materialsTitle: string; addMaterialButton: string; materialDialogTitle: string;
      materialTitleLabel: string; materialDescLabel: string; materialsEmpty: string;
      questionsTitle: string; deleteStageConfirm: string; deleteMaterialConfirm: string;
    };
    questions: {
      title: string; desc: string; addVariantButton: string; variantDialogTitle: string;
      variantNameLabel: string; questionsCountSuffix: string; backToVariants: string;
      addQuestionButton: string; questionDialogTitle: string; editQuestionDialogTitle: string;
      questionTextLabel: string; explanationLabel: string; optionLabel: string; imageUrlLabel: string;
      markCorrectHint: string; deleteConfirm: string; deleteVariantConfirm: string;
      deleteSuccess: string; deleteError: string; createSuccess: string; editSuccess: string;
      saveError: string; empty: string; emptyQuestions: string; editButton: string; deleteButton: string;
    };
  };
  test: {
    chooseModeTitle: string; mode20Label: string; mode50Label: string; startButton: string;
    questionOf: string; timeLeftLabel: string; resultTitle: string; scoreLabel: string;
    correctLabel: string; wrongLabel: string; backToDashboard: string; retakeButton: string;
    leaveWarning: string; loadingQuestions: string;
  };
  studentVariantli: {
    title: string; desc: string; empty: string; startTestButton: string; backToVariants: string;
  };
  studentStats: {
    title: string; desc: string; totalTests: string; averageScore: string; bestScore: string;
    colModule: string; colDate: string; colScore: string; colDuration: string; empty: string;
    moduleVariant: string; moduleTopic: string; moduleExam: string; moduleTraining: string;
  };
  studentBosqichli: {
    title: string; desc: string; empty: string;
  };
  studentTalim: {
    title: string; desc: string; empty: string; backToStages: string; materialsTitle: string;
    materialsEmpty: string; memorizeTitle: string; memorizeDesc: string; startTestButton: string;
    correctAnswerLabel: string; questionsEmpty: string;
  };
  studentSaved: {
    title: string; desc: string; empty: string; removeButton: string;
  };
  studentMistakes: {
    title: string; desc: string; empty: string; mistakeCountLabel: string; startTestButton: string;
  };
}
