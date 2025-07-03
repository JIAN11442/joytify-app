import { IoMdPower } from "react-icons/io";
import { LiaDesktopSolid } from "react-icons/lia";
import { BsLaptop, BsPhone, BsTablet } from "react-icons/bs";

import Icon from "./react-icons.component";
import { DevicesListSkeleton } from "./skeleton-loading.component";
import { useScopedIntl } from "../hooks/intl.hook";
import { useSignOutTargetDeviceMutation } from "../hooks/session-mutate.hook";
import { SessionResponse } from "@joytify/shared-types/types";
import useLocaleState from "../states/locale.state";
import { getTimeAgo } from "../utils/get-time.util";
import { timeoutForDelay } from "../lib/timeout.lib";

type DeviceListProps = {
  sessions: SessionResponse[] | undefined;
};

const DeviceList: React.FC<DeviceListProps> = ({ sessions }) => {
  const { fm } = useScopedIntl();
  const { themeLocale } = useLocaleState();
  const { mutate: signOutTargetDeviceFn } = useSignOutTargetDeviceMutation();

  const handleSignOutTargetDevice = (id: string) => {
    timeoutForDelay(() => {
      signOutTargetDeviceFn(id);
    });
  };

  const deviceListFm = fm("settings.connectedDevices.list");
  const deviceTypeFm = fm("settings.connectedDevices.device.type");

  if (!sessions) return <DevicesListSkeleton thCount={7} tdCount={3} />;

  return (
    <div
      className={`
        w-full
        max-h-[500px]
        p-3 
        border-[0.1px]
        border-neutral-400/10
        bg-neutral-400/10
        overflow-x-auto
        rounded-md 
      `}
    >
      <table className={`min-w-full text-sm text-left`}>
        {/* header */}
        <thead className={`border-b border-grey-custom/5`}>
          <tr>
            <th>{deviceListFm("header.device")}</th>
            <th>{deviceListFm("header.status")}</th>
            <th>{deviceListFm("header.lastActive")}</th>
            <th>{deviceListFm("header.browser")}</th>
            <th>{deviceListFm("header.os")}</th>
            <th>{deviceListFm("header.ipAddress")}</th>
            <th>{deviceListFm("header.location")}</th>
          </tr>
        </thead>

        {/* body */}
        <tbody className={`overflow-y-auto`}>
          {sessions.map((session) => {
            const { _id: id, device, browser, location, status, isCurrent } = session;
            const deviceIcon =
              device.type === "Mobile"
                ? BsPhone
                : device.type === "Tablet"
                ? BsTablet
                : device.type === "Desktop"
                ? LiaDesktopSolid
                : BsLaptop;

            return (
              <tr
                key={id}
                className={`
                  border-b
                  border-grey-custom/5
                  text-neutral-200
                  font-light
                `}
              >
                {/* name & type */}
                <td className={`max-w-[200px]`}>
                  <div className={`flex gap-3 items-center`}>
                    <div className={`w-fit shrink-0 p-3 bg-[#37415120] rounded-md`}>
                      <Icon name={deviceIcon} opts={{ size: 25 }} className={`text-neutral-300`} />
                    </div>
                    <div className={`flex flex-col gap-2`}>
                      <p>{device.name}</p>
                      <span className="text-xs text-gray-400">
                        {deviceTypeFm(device.type.toLowerCase())}
                      </span>
                    </div>
                  </div>
                </td>

                {/* online status */}
                <td>
                  <div
                    className={`
                      flex 
                      gap-2
                      items-center
                      whitespace-nowrap
                    `}
                  >
                    <div
                      className={`p-[0.25rem] rounded-full ${
                        status.online
                          ? "bg-green-400 border border-green-400/50 shadow-[0_0_10px_rgba(0,0,0,0.5)] shadow-green-400/50 animate-pulse"
                          : "bg-red-400 border border-red-400/50 shadow-[0_0_10px_rgba(0,0,0,0.5)] shadow-red-400/50"
                      }`}
                    />
                    <p
                      className={`
                        p-1.5
                        px-2
                        text-sm
                        ${
                          status.online
                            ? "bg-green-400/10 text-green-200"
                            : "bg-red-400/10 text-red-200"
                        } 
                        rounded-full
                      `}
                    >
                      {deviceListFm(status.online ? "status.online" : "status.offline")}
                    </p>
                  </div>
                </td>

                {/* last active */}
                <td>{getTimeAgo(status.lastActive, themeLocale)}</td>

                {/* browser */}
                <td>{browser.name}</td>

                {/* os */}
                <td>{device.os}</td>

                {/* ip address */}
                <td className={`break-words min-w-[200px]`}>{location.ipAddress}</td>

                {/* location */}
                <td>
                  {location.city}
                  <br />
                  <span className="text-xs text-gray-400">{location.country}</span>
                </td>

                {/* action */}
                <td>
                  <button
                    onClick={() => handleSignOutTargetDevice(id)}
                    title="登出"
                    className={`hover-btn hover:scale-110 ${isCurrent ? "hidden" : "block"}`}
                  >
                    <Icon name={IoMdPower} opts={{ size: 20 }} className={`text-blue-400`} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DeviceList;
