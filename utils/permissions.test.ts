import { hasPermission, integerToPermissions, permissionsToInteger, Permissions } from './permissions'

test('[PERMISSIONS] hasPermission', () => {
  expect(hasPermission(0x8, Permissions.ADMINISTRATOR)).toBeTruthy()
  expect(hasPermission(0x4, Permissions.EMBED_LINKS)).toBeFalsy()
})

test('[PERMISSIONS] integerToPermissions', () => {
  expect(integerToPermissions(8)).toStrictEqual(['ADMINISTRATOR'])
  expect(integerToPermissions(372760129)).toStrictEqual([
    'CREATE_INSTANT_INVITE',
    'ADD_REACTIONS',
    'STREAM',
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS',
    'CONNECT',
    'SPEAK',
    'USE_VAD',
    'CHANGE_NICKNAME',
    'MANAGE_ROLES'
  ])
})

test('[PERMISSIONS] permissionToInteger', () => {
  expect(permissionsToInteger(['ADMINISTRATOR'])).toEqual(8)
  expect(permissionsToInteger([
    'CREATE_INSTANT_INVITE',
    'ADD_REACTIONS',
    'STREAM',
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS',
    'CONNECT',
    'SPEAK',
    'USE_VAD',
    'CHANGE_NICKNAME',
    'MANAGE_ROLES'
  ])).toEqual(372760129)
})
