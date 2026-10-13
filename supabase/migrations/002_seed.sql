-- First season seed (run AFTER 001_init.sql)
insert into seasons (
  title, diversion_point,
  faction_a_name, faction_a_desc, faction_a_color,
  faction_b_name, faction_b_desc, faction_b_color,
  start_date, end_date, is_active
) values (
  '알렉산더의 선택',
  '기원전 323년, 알렉산더 대왕이 바빌론에서 열병으로 쓰러지지 않고 살아남았다. 제국의 동쪽 경계에서 그는 결정해야 한다 — 계속 나아갈 것인가, 돌아설 것인가.',
  '동진파 (East)',
  '인도와 중국까지 헬레니즘 문명을 전파해야 한다. 정복을 멈추면 제국은 썩는다. 알렉산더는 살아있는 한 나아가야 한다.',
  '#4A90D9',
  '안정파 (Consolidate)',
  '광대한 제국을 먼저 통합하고 법과 문화를 정착시켜야 한다. 확장보다 깊이. 알렉산더는 지금 가진 것을 지켜야 한다.',
  '#E8823A',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  true
);
