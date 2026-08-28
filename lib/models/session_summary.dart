class SessionSummary {
  const SessionSummary({
    required this.id,
    required this.name,
    required this.tag,
    required this.dirPath,
    required this.createdAt,
    required this.pageCount,
  });

  final String id;
  final String name;
  final String tag;
  final String dirPath;
  final DateTime createdAt;
  final int pageCount;
}
