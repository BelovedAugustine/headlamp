import { Icon } from '@iconify/react';
import { useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useTypedSelector } from '../../../redux/reducers/reducers';
import Empty from '../../common/EmptyContent';
import { DateLabel } from '../../common/Label';
import Link from '../../common/Link';
import SectionBox from '../../common/SectionBox';
import SectionFilterHeader from '../../common/SectionFilterHeader';
import SimpleTable from '../../common/SimpleTable';
import { Notification, setNotifications, updateNotifications } from './notificationsSlice';

export default function NotificationList() {
  const notifications = useTypedSelector(state => state.notifications.notifications);
  const clusters = useTypedSelector(state => state.config.clusters);
  const { t } = useTranslation(['glossary', 'translation']);
  const dispatch = useDispatch();
  const theme = useTheme();
  const search = useTypedSelector(state => state.filter.search);
  const history = useHistory();

  const allNotificationsAreDeleted = useMemo(() => {
    return !notifications.find(notification => !notification.deleted);
  }, [notifications]);

  const hasUnseenNotifications = useMemo(() => {
    return !!notifications.find(notification => !notification.deleted && !notification.seen);
  }, [notifications]);

  function notificationSeenUnseenHandler(event: any, notification?: Notification) {
    if (!notification) {
      return;
    }
    dispatch(updateNotifications(notification));
  }

  function clearAllNotifications() {
    const massagedNotifications = notifications.map(notification => {
      const updatedNotification = Object.assign(new Notification(), notification);
      updatedNotification.deleted = true;
      return updatedNotification;
    });
    dispatch(setNotifications(massagedNotifications));
  }

  function markAllAsRead() {
    const massagedNotifications = notifications.map(notification => {
      const updatedNotification = Object.assign(new Notification(), notification);
      updatedNotification.seen = true;
      return updatedNotification;
    });
    dispatch(setNotifications(massagedNotifications));
  }

  function notificationItemClickHandler(notification: Notification) {
    notification.url && history.push(notification.url);
    notification.seen = true;
    dispatch(updateNotifications(notification));
  }

  function NotificationActionMenu() {
    const [anchorEl, setAnchorEl] = useState(null);

    function handleClick(event: any) {
      setAnchorEl(event.currentTarget);
    }

    function handleClose() {
      setAnchorEl(null);
    }

    return (
      <>
        <IconButton size="medium">
          <Icon icon="mdi:dots-vertical" onClick={handleClick} />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={markAllAsRead} disabled={!hasUnseenNotifications}>
            <Typography color={'primary'}>{t('translation|Mark all as read')}</Typography>
          </MenuItem>
          <MenuItem onClick={clearAllNotifications} disabled={allNotificationsAreDeleted}>
            <Typography color="primary">{t('translation|Clear all')}</Typography>
          </MenuItem>
        </Menu>
      </>
    );
  }

  return (
    <SectionBox
      title={
        <SectionFilterHeader
          title={t('translation|Notifications')}
          noNamespaceFilter
          actions={[<NotificationActionMenu />]}
        />
      }
      backLink
    >
      {allNotificationsAreDeleted ? (
        <Empty> {t("translation|You don't have any notifications right now")}</Empty>
      ) : (
        <Box
          style={{
            maxWidth: '100%',
          }}
        >
          <SimpleTable
            filterFunction={(notification: Notification) =>
              (notification?.message?.toLowerCase() || '').includes(search.toLowerCase())
            }
            columns={[
              {
                label: t('translation|Message'),
                gridTemplate: 'auto',
                getter: (notification: Notification) => (
                  <Box>
                    <Tooltip
                      title={notification.message || t('translation|No message')}
                      disableHoverListener={!notification.message}
                    >
                      <Typography
                        style={{
                          fontWeight: notification.seen ? 'normal' : 'bold',
                          cursor: 'pointer',
                        }}
                        noWrap
                        onClick={() => notificationItemClickHandler(notification)}
                      >
                        {`${notification.message || t(`translation|No message`)}`}
                      </Typography>
                    </Tooltip>
                  </Box>
                ),
              },
              {
                label: t('glossary|Cluster'),
                gridTemplate: 'min-content',
                getter: (notification: Notification) => (
                  <Box display={'flex'} alignItems="center">
                    {Object.entries(clusters || {}).length > 1 && notification.cluster && (
                      <Box
                        border={0}
                        p={0.5}
                        mr={1}
                        textOverflow="ellipsis"
                        overflow={'hidden'}
                        whiteSpace="nowrap"
                      >
                        <Link routeName="cluster" params={{ cluster: `${notification.cluster}` }}>
                          {notification.cluster}
                        </Link>
                      </Box>
                    )}{' '}
                  </Box>
                ),
              },
              {
                label: t('translation|Date'),
                gridTemplate: 'min-content',
                getter: (notification: Notification) => <DateLabel date={notification.date} />,
              },
              {
                label: t('translation|Visible'),
                gridTemplate: 'min-content',
                getter: (notification: Notification) =>
                  !notification.seen && (
                    <Tooltip title={t(`translation|Mark as read`)}>
                      <IconButton
                        onClick={e => notificationSeenUnseenHandler(e, notification)}
                        aria-label={t(`translation|Mark as read`)}
                        size="medium"
                      >
                        <Icon
                          icon="mdi:circle"
                          color={theme.palette.error.main}
                          height={12}
                          width={12}
                        />
                      </IconButton>
                    </Tooltip>
                  ),
              },
            ]}
            data={notifications}
            noTableHeader
          />
        </Box>
      )}
    </SectionBox>
  );
}
