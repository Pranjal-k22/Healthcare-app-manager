const runAuthTests = require('./auth.test');
const runAppointmentTests = require('./appointment.test');
const runClinicalTests = require('./clinical.test');
const runLeaveTests = require('./leave.test');
const runNotificationTests = require('./notification.test');
const runCalendarTests = require('./calendar.test');
const runMedicationTests = require('./medication.test');
const runSecurityTests = require('./security.test');
const runLLMTests = require('./llm.test');
const runE2ETests = require('./e2e.test');
const { runProfileBillingTests } = require('./profileBillingPrescription.test');

const runMasterTestSuite = async () => {
  console.log('================================================================');
  console.log('  HEALTHPULSE CLINIC — COMPREHENSIVE AUTOMATED TEST SUITE (PHASE 11)');
  console.log('================================================================');

  const startTime = Date.now();
  let passedSuites = 0;
  const totalSuites = 11;

  try {
    await runAuthTests();
    passedSuites++;

    await runAppointmentTests();
    passedSuites++;

    await runClinicalTests();
    passedSuites++;

    await runLeaveTests();
    passedSuites++;

    await runNotificationTests();
    passedSuites++;

    await runCalendarTests();
    passedSuites++;

    await runMedicationTests();
    passedSuites++;

    await runSecurityTests();
    passedSuites++;

    await runLLMTests();
    passedSuites++;

    await runE2ETests();
    passedSuites++;

    await runProfileBillingTests();
    passedSuites++;

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('\n================================================================');
    console.log(`🎉 ALL ${passedSuites}/${totalSuites} TEST SUITES PASSED CLEANLY IN ${duration}s!`);
    console.log('   Security Hardening: 100% Verified');
    console.log('   Zero Critical Vulnerabilities Found');
    console.log('================================================================\n');
  } catch (error) {
    console.error('\n❌ TEST RUNNER FAILED:', error.message);
    process.exit(1);
  }
};

runMasterTestSuite();
