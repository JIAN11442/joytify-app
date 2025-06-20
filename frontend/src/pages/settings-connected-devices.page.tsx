import { PiDevices } from "react-icons/pi";
import DeviceList from "../components/device-list.component";
import AnimationWrapper from "../components/animation-wrapper.component";
import PageSectionTitle from "../components/page-section-title.component";
import DeviceStatusOverview from "../components/device-status-overview.component";
import { useGetUserSessionsQuery } from "../hooks/session-query.hook";
import { useScopedIntl } from "../hooks/intl.hook";

const SettingsConnectedDevicesPage = () => {
  const { fm } = useScopedIntl();
  const settingsConnectedDevicesFm = fm("settings.connectedDevices");

  const { userSessions, deviceStats } = useGetUserSessionsQuery();

  return (
    <div className={`settings-page-container`}>
      {/* title */}
      <AnimationWrapper initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <PageSectionTitle
          icon={{ name: PiDevices }}
          title={settingsConnectedDevicesFm("title")}
          description={settingsConnectedDevicesFm("description")}
        />
      </AnimationWrapper>

      <div className={`flex flex-col gap-10`}>
        {/* overview */}
        <AnimationWrapper initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <DeviceStatusOverview deviceStats={deviceStats} />
        </AnimationWrapper>

        {/* table */}
        <AnimationWrapper initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <DeviceList sessions={userSessions} />
        </AnimationWrapper>
      </div>
    </div>
  );
};

export default SettingsConnectedDevicesPage;
